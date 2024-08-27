'use server';

import { getReservationsByDateAsync } from '@/data/reservationData';

export const getReservationsByDate = async (date: Date) => {
  const reservationsByDate = await getReservationsByDateAsync(date);

  return reservationsByDate;
};
