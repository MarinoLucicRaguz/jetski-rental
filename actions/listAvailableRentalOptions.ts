'use server';

import { getAllRentalOptionsThatAreAvailable } from '@/repo/rentaloption';

export const getAvailableReservationOptions = async () => {
  const listReservationOptions = await getAllRentalOptionsThatAreAvailable();

  return listReservationOptions;
};
