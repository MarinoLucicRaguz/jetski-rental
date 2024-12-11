'use server';

import { GetAllRentalOptionsAsync } from '@/repo/rentaloption';

export const getAllRentalOptions = async () => {
  const listReservationOptions = await GetAllRentalOptionsAsync();
  return listReservationOptions;
};
