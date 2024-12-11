'use server';

import { db } from '@/lib/db';

import { GetJetskiByIdAsync } from '@/repo/jetski';

export const deleteJetski = async (id: number) => {
  const existingJetski = await GetJetskiByIdAsync(id);

  if (!existingJetski) {
    return { error: 'Ovaj jetski ne postoji.' };
  }

  try {
    await db.jetski.update({
      where: { id },
      data: { status: 'NOT_IN_FLEET' },
    });

    return { success: 'Uspješno ste ažurirali jetski.' };
  } catch (error) {
    return { error: 'Pogreška tokom ažuriranja jetskija.' };
  }
};
