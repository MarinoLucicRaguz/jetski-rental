'use server';

import { getAllRentalOptionsAsync } from '@/data/rentalOptionData';

export const getAllRentalOptions = async () => {
  const listReservationOptions = await getAllRentalOptionsAsync();
  return listReservationOptions;
};
