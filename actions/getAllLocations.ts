'use server';

import { GetLocationAsync } from '@/repo/location';

export const getAllLocations = async () => {
  const locations = await GetLocationAsync();

  return locations;
};
