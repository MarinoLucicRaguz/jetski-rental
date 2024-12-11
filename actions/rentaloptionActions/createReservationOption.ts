'use server';
import { db } from '@/lib/db';
import * as z from 'zod';
import { ReservationOptionSchema } from '@/schemas';
import { GetRentalOptionByDurationAsync } from '@/repo/rentaloption';

export const createReservationOption = async (values: z.infer<typeof ReservationOptionSchema>) => {
  const validatedField = ReservationOptionSchema.safeParse(values);
  if (!validatedField.success) return { error: 'Greška s unesenim podacima.' };

  const { price, description, duration } = validatedField.data;
  if (price < 0) return { error: 'We should not pay to the customers for the ride :)' };

  const rentalOption = await GetRentalOptionByDurationAsync(duration);
  if (rentalOption?.some((option) => option.description === description)) return { error: 'Već postoji takva opcija najma.' };

  await db.rentalOption.create({
    data: {
      description,
      duration,
      price,
    },
  });

  return {
    success: 'Uspješno ste dodali novu opciju najma.',
  };
};
