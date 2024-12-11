'use server';

import { getReservationByLocationForToday } from '@/repo/reservationData';

export const getTodayReservationByLocation = async (location_id: number) => {
  const reservationData = await getReservationByLocationForToday(location_id);

  return reservationData;
};
