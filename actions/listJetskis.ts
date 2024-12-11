'use server';

import { GetAllJetskisAsync } from '@/repo/jetski';

export const GetAllJetskis = async () => {
  const jetskis = await GetAllJetskisAsync();

  return jetskis;
};
