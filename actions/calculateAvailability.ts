"use server";

import { db } from "@/lib/db";
import { RentalOptions } from "@prisma/client";

interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  available_jetskis: number;
  location?: number;
}

const BUFFER_MINUTES = 5;

const generateDynamicSlots = (rentDate: Date, durationMinutes: number, timezoneOffset: number): { start: Date, end: Date }[] => {
  const slots = [];

  const slotStartTime = new Date(rentDate);
  const now = new Date();
  now.setMinutes(now.getMinutes() - timezoneOffset)

  console.log("generateDynamicSlots - now: " ,now)
  if ((rentDate.toDateString() === now.toDateString()) && (now.getHours() > 7)) {
    slotStartTime.setHours(now.getHours(), Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
  } else {
    slotStartTime.setHours(7, 0, 0, 0);
  }
  
  console.log("generateDynamicSlots - slotStartTime: ", slotStartTime)

  const dayEndTime = new Date(rentDate);
  dayEndTime.setHours(21, 0, 0, 0);

  const latestStartTime = new Date(rentDate);
  latestStartTime.setHours(19, 25, 0, 0);

console.log("dayendtime: ", dayEndTime)
console.log("lateststarttime ", latestStartTime)

  while (slotStartTime < dayEndTime) {
    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setMinutes(slotStartTime.getMinutes() + durationMinutes);

    if (slotEndTime > dayEndTime || slotStartTime > latestStartTime) break;

    slots.push({ start: new Date(slotStartTime), end: new Date(slotEndTime) });

    slotStartTime.setMinutes(slotStartTime.getMinutes() + 5);
  }

  return slots;
};

export const calculateAvailability = async (
  dateString: string,
  jetskiCount: number,
  rentalOption: RentalOptions,
  timezoneOffset: number,
  location?: number,
): Promise<AvailabilitySlot[]> => {
  const rentDate = new Date(dateString)
  const hourDiff = timezoneOffset/60;

  console.log(hourDiff)


  const startTime = new Date(dateString);
  const endTime = new Date(dateString);
  
  startTime.setHours(9, 0, 0, 0);
  endTime.setHours(20, 0, 0, 0);
  rentDate.setMinutes(rentDate.getMinutes() - timezoneOffset)
  
  console.log(dateString)
  console.log("Calculate availability - RentDate: ", rentDate)
  console.log("Calculate availability - StartTime: ", startTime)
  console.log("Calculate availability - EndTime: " , endTime)
  
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
  
  const slots = generateDynamicSlots(rentDate, rentalOption.duration, timezoneOffset);
  
  const availabilitySlots: AvailabilitySlot[] = [];

  let availableJetskis;
  if (!location) {
    availableJetskis = await db.jetski.findMany({
      where: {
        jetski_status: 'AVAILABLE',
      },
    });
  } else {
    availableJetskis = await db.jetski.findMany({
      where: {
        jetski_status: 'AVAILABLE',
        jetski_location_id: location,
      },
    });
  }

  const totalAvailableJetskis = availableJetskis.length;

  if (rentalOption.rentaloption_description === "SAFARI") {
    jetskiCount += 1;
  }

  let currentSlotIndex = 0;

  while (currentSlotIndex < slots.length) {
    const slot = slots[currentSlotIndex];
    const slotEndWithBuffer = new Date(slot.end.getTime() + BUFFER_MINUTES * 60 * 1000);
    
    const overlappingReservations = reservations.filter((reservation) => {
      const reservationStartTime = new Date(reservation.startTime);
      const reservationEndTime = new Date(reservation.endTime);
      const reservationEndWithBuffer = new Date(reservationEndTime.getTime() + BUFFER_MINUTES * 60 * 1000);
      return (
        (reservationStartTime < slotEndWithBuffer && reservationEndWithBuffer > slot.start)
      );
    });

    const locationFilteredReservations = overlappingReservations.filter((reservation) => {
      return !location || reservation.reservation_jetski_list.some(jetski => jetski.jetski_location_id === location);
    });

    const reservedJetskis = locationFilteredReservations.reduce((count, reservation) => {
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
