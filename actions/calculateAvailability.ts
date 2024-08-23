"use server";

const moment = require('moment-timezone')

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
  duration: number,
  startTime: Date,
  endTime: Date,
): { start: Date, end: Date }[] => {
  const slots = [];
  const now = moment().tz("UTC");

  let start = moment(startTime).tz("UTC");
  const end = moment(endTime).tz("UTC");

  console.log("Početak i kraj generiranja slotova: ", start,end)
  if (start.isSame(now, 'day') && now.isAfter(start)) {
    start = now.clone().minute(Math.ceil(now.minute() / 5) * 5).second(0);
  }

  while (start.isBefore(end) || start.isSame(end)) {
    const slotEndTime = start.clone().add(duration, 'minutes');

    // if (slotEndTime.isAfter(end) && !slotEndTime.isSame(end)) break; AKO IMA PREKOVREMENOG

    slots.push({ start: start.toDate(), end: slotEndTime.toDate() });

    start.add(BUFFER_MINUTES, 'minutes');
  }
  return slots;
};

export const calculateAvailability = async (
  dayStartTime: Date,
  dayEndTime: Date,
  jetskiCount: number,
  rentalOption: RentalOptions,
  location?: number,
): Promise<AvailabilitySlot[]> => {
  console.log("Calculate availability - StartTime: ", dayStartTime)
  console.log("Calculate availability - EndTime: " , dayEndTime)
  
  const slots = generateDynamicSlots(rentalOption.duration, dayStartTime, dayEndTime);
  console.log(slots[slots.length-1]);
  const reservations = await db.reservation.findMany({
    where: {
      startTime: {
        gte: dayStartTime,
        lt: dayEndTime,
      },
    },
    include: {
      reservation_jetski_list: true,
    },
  });
  
  
  const availabilitySlots: AvailabilitySlot[] = [];

  let numberOfAvailableVehicles;
  
  if (!location) {
    numberOfAvailableVehicles = await db.jetski.count({
      where: {
        jetski_status: 'AVAILABLE',
      },
    });
  } else {
    numberOfAvailableVehicles = await db.jetski.count({
      where: {
        jetski_status: 'AVAILABLE',
        jetski_location_id: location,
      },
    });
  }

  if (rentalOption.rentaloption_description === "SAFARI") {
    jetskiCount += 1;
  }

  reservations.forEach((reservation) => {
    const reservationStartTime = new Date(reservation.startTime);
    const reservationEndTime = new Date(reservation.endTime);
    const reservationEndWithBuffer = new Date(reservationEndTime.getTime() + BUFFER_MINUTES * 60 * 1000);

    slots.forEach((slot, index) => {
      if (
        reservationStartTime < new Date(slot.end.getTime() + BUFFER_MINUTES * 60 * 1000) &&
        reservationEndWithBuffer > slot.start
      ) {
        const locationFiltered = !location || reservation.reservation_jetski_list.some(jetski => jetski.jetski_location_id === location);
        const reservedJetskis = reservation.reservation_jetski_list.length;

        if (locationFiltered && (numberOfAvailableVehicles - reservedJetskis < jetskiCount)) {
          slots.splice(index, 1); // Remove this slot
        }
      }
    });
  });

  // Convert remaining slots to AvailabilitySlot format
  slots.forEach(slot => {
    availabilitySlots.push(slot => ({
      start_time: slot.start.toTimeString(),
      end_time: slot.end.toTimeString(),
      available_jetskis: numberOfAvailableVehicles, 
    }))
  });
  slots.map(slot => ({
    start_time: slot.start.toTimeString(),
    end_time: slot.end.toTimeString(),
    available_jetskis: numberOfAvailableVehicles,  // Assuming all remaining slots have the same available jetskis
  }));

  return availabilitySlots;
};
  
  // let currentSlotIndex = 0;
  // while (currentSlotIndex < slots.length) {
  //   const slot = slots[currentSlotIndex];
  //   const slotEndWithBuffer = new Date(slot.end.getTime() + BUFFER_MINUTES * 60 * 1000);

  //   const overlappingReservations = reservations.filter((reservation) => {
  //     const reservationStartTime = new Date(reservation.startTime);
  //     const reservationEndTime = new Date(reservation.endTime);
  //     const reservationEndWithBuffer = new Date(reservationEndTime.getTime() + BUFFER_MINUTES * 60 * 1000);
    
  //     const isOverlapping = (
  //       reservationStartTime < slotEndWithBuffer && reservationEndWithBuffer > slot.start
  //     );
    
  //     return isOverlapping;
  //   });
    
  //   const locationFilteredReservations = overlappingReservations.filter((reservation) => {
  //     return !location || reservation.reservation_jetski_list.some(jetski => jetski.jetski_location_id === location);
  //   });

  //   const reservedJetskis = locationFilteredReservations.reduce((count, reservation) => {
  //     return count + reservation.reservation_jetski_list.length;
  //   }, 0);

  //   const availableJetskisCount = numberOfAvailableVehicles - reservedJetskis;

  //   if (availableJetskisCount >= jetskiCount) {
  //     availabilitySlots.push({
  //       start_time: slot.start.toTimeString().slice(0, 5),
  //       end_time: slot.end.toTimeString().slice(0, 5),
  //       available_jetskis: availableJetskisCount,
  //     });
  //     currentSlotIndex += Math.floor(60 / 5);
  //   } else {
  //     currentSlotIndex += 1;
  //   }
  // }
  // return availabilitySlots;
// };
