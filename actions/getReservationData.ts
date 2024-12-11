'use server';

import { getReservationById } from '@/repo/reservationData';

export const getReservationData = async (reservation_id: number) => {
  const reservationData = await getReservationById(reservation_id);

  return reservationData;
};
