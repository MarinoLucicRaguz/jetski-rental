'use server';

import { GetActiveRentalOptionsAsync } from '@/repo/rentaloption';

export const GetActiveRentalOptions = async () => {
  const listReservationOptions = await GetActiveRentalOptionsAsync();

  return listReservationOptions;
};
