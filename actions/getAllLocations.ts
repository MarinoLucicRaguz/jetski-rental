'use server';

import { getAllLocationsAsync } from '@/data/locationData';

export const getAllLocations = async () => {
  const locations = await getAllLocationsAsync();

  return locations;
};
