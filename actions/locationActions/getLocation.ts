'use server';

import { GetLocationByIdAsync } from '@/repo/location';

export const GetLocationById = async (id: number) => {
  const location = await GetLocationByIdAsync(id);
  return location;
};
