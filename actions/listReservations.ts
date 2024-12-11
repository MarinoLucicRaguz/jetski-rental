'use server';

import { fetchReservations } from '@/repo/reservationData';

export const getAllReservations = async () => {
  const listReservations = await fetchReservations();

  return listReservations;
};
