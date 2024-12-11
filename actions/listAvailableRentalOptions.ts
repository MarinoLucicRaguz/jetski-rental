'use server';

import { GetActiveRentalOptionsAsync } from '@/repo/rentaloption';

export const getAvailableReservationOptions = async () => {
  const listReservationOptions = await GetActiveRentalOptionsAsync();

  return listReservationOptions;
};
