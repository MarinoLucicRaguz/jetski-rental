'use server';

import { GetLocationByIdAsync } from '@/repo/location';
import { db } from '@/lib/db';

export const deleteLocation = async (id: number) => {
  const existingLocation = await GetLocationByIdAsync(id);

  if (!existingLocation) {
    return { error: 'Ova lokacija je već obrisana.' };
  }

  const existingReservations = await db.reservation.findMany({
    where: { reservation_location_id: id },
  });

  if (existingReservations.length > 0) {
    return { error: 'Na ovoj lokaciji postoje rezervacije. Molim vas prvo uklonite postojeće rezervacije.' };
  }

  const assignedJetskis = await db.jetski.findMany({
    where: { locationId: id },
  });

  if (assignedJetskis.length > 0) {
    return { error: 'Jetskis are assigned to this location.' };
  }

  try {
    await db.location.delete({
      where: { id: id },
    });

    return { success: 'Location deleted successfully!' };
  } catch (error) {
    console.error('Error deleting location:', error);
    return { error: 'Failed to delete location!' };
  }
};
