'use server';

import { getAllJetskisAsync } from '@/data/jetskiData';

export const GetAllJetskis = async () => {
  const jetskis = await getAllJetskisAsync();

  return jetskis;
};
