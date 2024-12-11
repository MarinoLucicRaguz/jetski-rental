'use server';

import { GetRentalOptionByIdAsync } from '@/repo/rentaloption';

export const getRentalOption = async (rentalOptionId: number) => {
  const rentalOption = await GetRentalOptionByIdAsync(rentalOptionId);

  return rentalOption;
};
