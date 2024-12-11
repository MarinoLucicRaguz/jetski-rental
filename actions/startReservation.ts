'use server';

import { db } from '@/lib/db';
import * as z from 'zod';
import { getReservationById } from '@/repo/reservationData';

export const startReservation = async (reservation_id: number) => {
  const reservation = await getReservationById(reservation_id);

  if (!reservation) return { error: 'The specified reservation does not exist.' };

  const jetskiIds = reservation.reservation_jetski_list.map((jetski) => jetski.jetski_id);

  const unavailableJetskis = await db.jetski.findMany({
    where: {
      jetski_id: {
        in: jetskiIds,
      },
      jetski_status: {
        not: 'AVAILABLE',
      },
    },
  });

  if (unavailableJetskis.length === 1) {
    return { error: 'One of the jetskis is out of service or decommisioned. Please edit the reservation and remove those jetskis.' };
  }

  if (unavailableJetskis.length > 1) {
    return { error: 'Some of the jetskis are out of service or decommisioned. Please edit the reservation and remove those jetskis.' };
  }

  try {
    await db.reservation.update({
      where: { reservation_id },
      data: {
        isCurrentlyRunning: true,
      },
    });

    return { success: 'Reservation has started!' };
  } catch (error) {
    console.error('Error starting reservation:', error);
    return { error: 'An error occurred while starting the reservation.' };
  }
};
