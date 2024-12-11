'use server';
import { db } from '@/lib/db';
import * as z from 'zod';
import { JetskiReservationSchema } from '@/schemas';
import { DateTime } from 'luxon';

export const createReservation = async (values: z.infer<typeof JetskiReservationSchema>) => {
  const validatedFields = JetskiReservationSchema.safeParse(values);
  console.log(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const {
    rentDate,
    startTime,
    endTime,
    reservation_jetski_list,
    reservation_location_id,
    reservationOwner,
    contactNumber,
    totalPrice,
    rentaloption_id,
    discount,
  } = validatedFields.data;

  let newStartTime;

  if (rentDate.getDate() !== startTime.getDate()) {
    newStartTime = new Date(rentDate.getFullYear(), rentDate.getMonth(), rentDate.getDate(), startTime.getHours(), startTime.getMinutes());
  } else {
    newStartTime = startTime;
  }

  const startDateTime = DateTime.fromJSDate(newStartTime);
  const now = DateTime.now();
  const endDateTime = DateTime.fromJSDate(new Date(endTime));

  const rentalOption = await db.rentalOptions.findUnique({ where: { rentaloption_id } });

  if (rentalOption?.rentaloption_description === 'SAFARI' && reservation_jetski_list.length < 2) {
    return { error: 'Safari tour needs minimum two jetskis. One for guide and one for the guest.' };
  }

  if (rentalOption?.rentaloption_description === 'REGULAR' && reservation_jetski_list.length < 1) {
    return { error: 'Regular tour needs minimum one jetski.' };
  }

  if (startDateTime < now) {
    return { error: 'You have selected a starting time that has already passed!' };
  }

  if (startDateTime >= endDateTime) {
    return { error: 'End time must be after start time.' };
  }

  const locationExists = await db.location.findUnique({
    where: { location_id: reservation_location_id },
  });
  if (!locationExists) {
    return { error: 'The specified location does not exist.' };
  }

  const jetskiAvailabilityChecks = reservation_jetski_list.map(async (jetski) => {
    const reservations = await db.reservation.findMany({
      where: {
        reservation_jetski_list: {
          some: {
            id: jetski.jetski_id,
          },
        },
        NOT: [{ endTime: { lte: newStartTime } }, { startTime: { gte: endTime } }],
      },
    });
    return reservations;
  });

  const results = await Promise.all(jetskiAvailabilityChecks);
  if (results.some((isAvailable) => !isAvailable)) {
    return { error: 'One or more jet skis are not available in the chosen time slot.' };
  }

  try {
    const reservation = await db.reservation.create({
      data: {
        startTime: newStartTime,
        endTime,
        reservationOwner,
        contactNumber,
        totalPrice,
        discount,
        reservation_location: {
          connect: { location_id: reservation_location_id },
        },
        reservation_jetski_list: {
          connect: reservation_jetski_list.map((jetski) => ({ jetski_id: jetski.jetski_id })),
        },
        rentaloption_id,
      },
    });

    return {
      success: 'Reservation has been created successfully!',
      reservation,
    };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return { error: 'An error occurred while creating the reservation.' };
  }
};
