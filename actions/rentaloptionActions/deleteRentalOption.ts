'use server';

import { GetRentalOptionByIdAsync } from '@/repo/rentaloption';
import { findReservationUsingRentalOption } from '@/repo/reservationData';
import { db } from '@/lib/db';

export const deleteRentalOption = async (id: number) => {
  const [existingRentalOption, reservationUsingOption] = await Promise.all([GetRentalOptionByIdAsync(id), findReservationUsingRentalOption(id)]);

  if (!existingRentalOption) return { error: 'Pogreška prilikom deaktivacije. Molimo vas osvježite stranicu.' };
  if (reservationUsingOption)
    return { error: 'Ova opcija najma se koristi u rezervacijama. Molimo vas da je prvo uklonite iz preostalih rezervacija.' };

  try {
    await db.rentalOption.update({
      where: { id },
      data: { status: !existingRentalOption.status },
    });
    return { success: 'Uspješno ste deaktivirali opciju najma.' };
  } catch {
    return { error: 'Pogreška prilikom deaktivacije.' };
  }
};
