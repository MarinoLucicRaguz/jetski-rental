'use server';

import { getJetskiByLocationIdAsync } from '@/data/jetskiData';

export const listJetskisByLocation = async (location_id: number) => {
  const jetski = await getJetskiByLocationIdAsync(location_id);

  return jetski;
};
