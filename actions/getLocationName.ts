'use server';

import { GetLocationNameByIdAsync } from '@/repo/location';

export const getLocationName = async (locationId: number) => {
  const location_name = await GetLocationNameByIdAsync(locationId);

  return location_name;
};
