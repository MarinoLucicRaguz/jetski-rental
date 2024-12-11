'use server';
import { checkWhichJetskisAreCurrentlyRunning } from '@/repo/reservationData';

export const getCurrentlyRunningJetskis = async () => {
  const jetskis = await checkWhichJetskisAreCurrentlyRunning();

  return jetskis;
};
