'use server';

import { GetJetskiByLocationIdAsync } from '@/repo/jetski';

export const listJetskisByLocation = async (location_id: number) => {
  const jetski = await GetJetskiByLocationIdAsync(location_id);

  return jetski;
};
