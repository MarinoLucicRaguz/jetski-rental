'use server';

import { GetLocationAsync } from '@/repo/location';

export const GetLocations = async () => {
  const locations = await GetLocationAsync();

  return locations;
};
