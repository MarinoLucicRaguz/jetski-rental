'use server';

import { getReservationsByDateAsync } from '@/repo/reservationData';

export const getReservationsByDate = async (date: Date) => {
  const reservationsByDate = await getReservationsByDateAsync(date);

  return reservationsByDate;
};
