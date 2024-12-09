'use server';
import { db } from '@/lib/db';
import * as z from 'zod';

import { JetskiSchema } from '@/schemas';
import { GetJetskiByRegistration } from '@/data/jetskiData';

export const createJetski = async (values: z.infer<typeof JetskiSchema>) => {
  const validatedFields = JetskiSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Uneseni podaci nisu točnog formata.', success: undefined };
  }

  const { registration, locationId, topSpeed, manufacturingYear, model } = validatedFields.data;

  const existingJetski = await GetJetskiByRegistration(registration);

  if (existingJetski) {
    return { error: 'Jetski s tom registracijom već postoji.', success: undefined };
  }

  try {
    await db.jetski.create({
      data: {
        registration,
        locationId,
        topSpeed,
        manufacturingYear,
        model,
      },
    });
    return { success: 'Dodali ste novi jetski.', error: undefined };
  } catch (error) {
    console.error('Error while creating a jetski:', error);
    return { error: 'Pogreška prilikom dodavanja jetskija. Molimo vas osvježite stranicu.', success: undefined };
  }
};
