'use server';
import { GetJetskiByIdAsync } from '@/repo/jetski';

export const getJetski = async (jetskiId: number) => {
  const jetski = await GetJetskiByIdAsync(jetskiId);
  return jetski;
};
