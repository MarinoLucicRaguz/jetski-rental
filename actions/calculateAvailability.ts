"use server";

import { db } from "@/lib/db";

interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  available_jetskis: number;
  location?: number;
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

    slotStartTime.setMinutes(slotStartTime.getMinutes() + 5);
  }

  return slots;
};

export const calculateAvailability = async (
  rentDate: Date,
  jetskiCount: number,
  rentalDurationMinutes: number,
  location?: number,
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

  let availableJetskis;
  if(!location)
  {
     availableJetskis = await db.jetski.findMany({
      where: {
        jetski_status: 'AVAILABLE',
      },
    });
  }
  else{
    availableJetskis = await db.jetski.findMany({
      where: {
        jetski_status: 'AVAILABLE',
        jetski_location_id: location,
      },
    });
  }

  const totalAvailableJetskis = availableJetskis.length;

  let currentSlotIndex = 0;

  while (currentSlotIndex < slots.length) {
    const slot = slots[currentSlotIndex];

    const overlappingReservations = reservations.filter((reservation) => {
      const reservationStartTime = new Date(reservation.startTime);
      const reservationEndTime = new Date(reservation.endTime);
      return (
        (reservationStartTime < slot.end && reservationEndTime > slot.start)
      );
    });

    const reservedJetskis = overlappingReservations.reduce((count, reservation) => {
      return count + reservation.reservation_jetski_list.length;
    }, 0);

    const availableJetskisCount = totalAvailableJetskis - reservedJetskis;

    if (availableJetskisCount >= jetskiCount) {
      availabilitySlots.push({
        start_time: slot.start.toTimeString().slice(0, 5),
        end_time: slot.end.toTimeString().slice(0, 5),
        available_jetskis: availableJetskisCount,
      });

      currentSlotIndex += Math.floor(60 / 5); 
    } else {
      currentSlotIndex += 1;
    }
  }

  return availabilitySlots;
};