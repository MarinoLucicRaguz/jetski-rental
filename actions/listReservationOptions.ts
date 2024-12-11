'use server';

import { getAllRentalOptionsAsync } from '@/repo/rentaloption';

export const getAllRentalOptions = async () => {
  const listReservationOptions = await getAllRentalOptionsAsync();
  return listReservationOptions;
};
