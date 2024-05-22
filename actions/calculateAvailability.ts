"use server";

import { db } from "@/lib/db";
import { RentalOptions, Reservation, Jetski } from "@prisma/client";

interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  available_jetskis: number;
}

const generateDynamicSlots = (rentDate: Date, durationMinutes: number): { start: Date, end: Date }[] => {
  const slots = [];
  const slotStartTime = new Date(rentDate);
  slotStartTime.setHours(7, 0, 0, 0); 

  const dayEndTime = new Date(rentDate);
  dayEndTime.setHours(19, 0, 0, 0); 

  while (slotStartTime < dayEndTime) {
    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setMinutes(slotStartTime.getMinutes() + durationMinutes);

    if (slotEndTime > dayEndTime) break;

    slots.push({ start: new Date(slotStartTime), end: new Date(slotEndTime) });

    slotStartTime.setMinutes(slotStartTime.getMinutes() + 5); // Increment by 5 minutes
  }

  return slots;
};

export const calculateAvailability = async (
  rentDate: Date,
  jetskiCount: number,
  rentalDurationMinutes: number
): Promise<AvailabilitySlot[]> => {
  const startTime = new Date(rentDate);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date(rentDate);
  endTime.setHours(23, 59, 59, 999);

  const reservations = await db.reservation.findMany({
    where: {
      startTime: {
        gte: startTime,
        lt: endTime,
      },
    },
    include: {
      reservation_jetski_list: true,
    },
  });

  const slots = generateDynamicSlots(rentDate, rentalDurationMinutes);

  const availabilitySlots: AvailabilitySlot[] = [];

  const jetskis = await db.jetski.findMany({});

  let currentSlotIndex = 0;

  while (currentSlotIndex < slots.length) {
    const slot = slots[currentSlotIndex];
    const availableJetskisCount = jetskis.filter((jetski) => {
      const overlappingReservations = reservations.filter((reservation) => {
        const reservationStartTime = new Date(reservation.startTime);
        const reservationEndTime = new Date(reservation.endTime);
        return (
          reservation.reservation_jetski_list.some((rj) => rj.jetski_id === jetski.jetski_id) &&
          ((reservationStartTime >= slot.start && reservationStartTime < slot.end) ||
            (reservationEndTime > slot.start && reservationEndTime <= slot.end) ||
            (reservationStartTime <= slot.start && reservationEndTime >= slot.end))
        );
      });
      return overlappingReservations.length === 0;
    }).length;

    if (availableJetskisCount >= jetskiCount) {
      availabilitySlots.push({
        start_time: slot.start.toTimeString().slice(0, 5),
        end_time: slot.end.toTimeString().slice(0, 5),
        available_jetskis: availableJetskisCount,
      });

      currentSlotIndex += Math.ceil(rentalDurationMinutes / 5);
    } else {
      currentSlotIndex += 1;
    }
  }

  return availabilitySlots;
};
