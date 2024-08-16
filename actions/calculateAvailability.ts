"use server";

//UKOLIKO JE DATE DOHVACEN SA KLIJENT STRANE ONDA IDE + TIMEZONEDIFF
//AKO JE DOHVACEN NA SERVER STRANI ONDA IDE - TIMEZONEDIFF
//AKO POSTAVLJAS VRIJEDNOST ONDA JE HARDCODAN

import { db } from "@/lib/db";
import { RentalOptions } from "@prisma/client";

interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  available_jetskis: number;
  location?: number;
}

const BUFFER_MINUTES = 5;

const generateDynamicSlots = (
  rentDate: Date,
  durationMinutes: number,
  startTime: Date,
  endTime: Date,
  timezoneOffset: number
): { start: Date, end: Date }[] => {
  const slots = [];

  const now = new Date();
  console.log(now)
  now.setMinutes(now.getMinutes() - timezoneOffset);

  console.log("Trenutno vrijeme pri generiranju slotova: ", now);

  if ((rentDate.toDateString() === now.toDateString()) && (now.getHours() > 9)) {
    startTime.setHours(now.getHours(), Math.ceil(now.getMinutes() / 5) * 5, 0, 0);
  } else {
    startTime.setHours(9, 0, 0, 0); //potencijalno zamijenit s globalnom varijablom ili iz postavke
  }
  
  console.log("Slot generating starting time: ", startTime)

  const latestStartTime = new Date(rentDate);
  latestStartTime.setHours(19, 30, 0, 0);

  console.log("Zadnje startno vrijeme: ", latestStartTime)

  while (startTime < endTime  && startTime <= latestStartTime) {
    const slotEndTime = new Date(startTime);
    slotEndTime.setMinutes(startTime.getMinutes() + durationMinutes);

    if (slotEndTime > endTime) break;

    slots.push({ start: new Date(startTime), end: new Date(slotEndTime) });

    startTime.setMinutes(startTime.getMinutes() + 5);
  }
  console.log(startTime)
  console.log(latestStartTime)

  console.log(endTime )
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
  const startTime = new Date(dateString);
  const endTime = new Date(dateString);
  
  startTime.setHours(9, 0 , 0, 0);
  endTime.setHours(19 , 30, 0, 0);

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
  
  const slots = generateDynamicSlots(rentDate, rentalOption.duration, startTime, endTime, timezoneOffset);
  
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
