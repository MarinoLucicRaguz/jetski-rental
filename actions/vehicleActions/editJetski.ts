'use server';
import { db } from '@/lib/db';
import * as z from 'zod';
import { JetskiSchema } from '@/schemas';
import { GetJetskiByIdAsync, GetJetskiByRegistrationAsync } from '@/repo/jetski';

export const editJetski = async (jetskiId: number, values: z.infer<typeof JetskiSchema>) => {
  const validatedFields = JetskiSchema.safeParse(values);

  if (!validatedFields.success) return { error: 'Pogrešan unos' };

  const { registration, locationId, topSpeed, manufacturingYear, model } = validatedFields.data;

  const doesJetskiExist = await GetJetskiByIdAsync(jetskiId);

  if (!doesJetskiExist) return { error: 'Ovaj jetski ne postoji. Molimo vas osvježite stranicu.' };

  const existingJetski = await GetJetskiByRegistrationAsync(registration);

  if (existingJetski && existingJetski.id !== jetskiId) return { error: 'Već postoji jetski s tim imenom.' };

  try {
    await db.jetski.update({
      where: { id: jetskiId },
      data: {
        registration,
        locationId,
        topSpeed,
        manufacturingYear,
        model,
      },
    });

    return { success: 'Uspješno ste ažurirali jetski.' };
  } catch (error) {
    return { error: 'Dogodila se greška prilikom ažuriranja podataka.', details: error };
  }
};
