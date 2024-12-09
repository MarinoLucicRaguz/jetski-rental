'use server';
import { db } from '@/lib/db';
import * as z from 'zod';

import { JetskiSchema } from '@/schemas';
import { getJetskiById, GetJetskiByRegistration } from '@/data/jetskiData';

export const editJetski = async (jetskiId: number, values: z.infer<typeof JetskiSchema>) => {
  const validatedFields = JetskiSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }
  const {
    registration: jetski_registration,
    locationId: jetski_location_id,
    topSpeed: jetski_topSpeed,
    manufacturingYear: jetski_manufacturingYear,
    model: jetski_model,
  } = validatedFields.data;

  const doesJetskiExist = await getJetskiById(jetskiId);

  if (!doesJetskiExist) {
    return { error: 'Jetski not found' };
  }

  const existingJetski = await GetJetskiByRegistration(jetski_registration);

  if (existingJetski && existingJetski.id !== jetskiId) {
    return { error: 'Jetski with that registration already exists!' };
  }

  try {
    await db.jetski.update({
      where: { id: jetskiId },
      data: {
        registration,
        jetski_location_id,
        jetski_topSpeed,
        jetski_manufacturingYear,
        jetski_model,
      },
    });

    return { success: 'Jetski successfully updated' };
  } catch (error) {
    return { error: 'Failed to update jetski', details: error };
  }
};
