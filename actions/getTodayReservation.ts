'use server';

import { fetchTodayReservation } from '@/repo/reservationData';

export const getTodayReservationData = async () => {
  const reservationData = await fetchTodayReservation();

  return reservationData;
};
