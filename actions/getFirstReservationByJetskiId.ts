'use server';

import { getFirstReservationsByJetskiIds } from '@/repo/reservationData';

export const getReservationByJetskiIds = async (jetskiIds: number[]) => {
  const reservation = await getFirstReservationsByJetskiIds(jetskiIds);

  return reservation;
};
