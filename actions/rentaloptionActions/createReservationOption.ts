'use server';
import { db } from '@/lib/db';
import * as z from 'zod';

import { ReservationOptionSchema } from '@/schemas';
import { getRentalOptionByDuration } from '@/repo/rentaloption';

const parseCurrencyValue = (value: string): number => {
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));

  const exchangeRates: Record<string, number> = {
    USD: 1.06593,
    GBP: 0.86168,
    EUR: 1,
    HRK: 7.53452,
  };

  const currencySymbols: Record<string, string> = {
    $: 'USD',
    '£': 'GBP',
    '€': 'EUR',
    HRK: 'HRK',
  };

  let currencyCode = 'EUR'; // Default currency is EUR
  for (const symbol of Object.keys(currencySymbols)) {
    if (value.includes(symbol)) {
      currencyCode = currencySymbols[symbol];
      break;
    }
  }

  if (!exchangeRates[currencyCode]) {
    throw new Error(`Unsupported currency: ${currencyCode}`);
  }

  const exchangeRate = exchangeRates[currencyCode];
  const valueInEur = currencyCode === 'EUR' ? numericValue : numericValue / exchangeRate;

  return valueInEur;
};

export const createReservationOption = async (values: z.infer<typeof ReservationOptionSchema>) => {
  const validatedField = ReservationOptionSchema.safeParse(values);

  if (!validatedField.success) {
    return { error: 'Invalid fields' };
  }

  const { rentalprice, rentaloption_description, duration } = validatedField.data;

  const isValidDuration = /^\d+$/.test(duration);
  if (!isValidDuration) {
    return { error: 'Duration must contain only numbers' };
  }

  const rentalOption = await getRentalOptionByDuration(parseInt(duration));

  if (rentalOption && rentalOption.length > 0) {
    const duplicateOption = rentalOption.find((option) => option.rentaloption_description === rentaloption_description);
    if (duplicateOption) {
      return { error: 'Rental option with that description and duration already exists!' };
    }
  }

  if (rentaloption_description !== 'SAFARI' && rentaloption_description !== 'REGULAR') {
    return { error: 'Please select correct rental option type.' };
  }

  const rentalpriceInt = parseCurrencyValue(rentalprice);

  if (rentalpriceInt < 0) {
    return { error: 'We should not pay to the customers for the ride :)' };
  }

  await db.rentalOptions.create({
    data: {
      rentaloption_description,
      duration: parseInt(duration),
      rentalprice: rentalpriceInt,
    },
  });

  return {
    success: 'Rental option has been added successfully!',
  };
};
