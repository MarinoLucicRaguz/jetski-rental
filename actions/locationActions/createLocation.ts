'use server';
import { db } from '@/lib/db';
import * as z from 'zod';
import { LocationSchema } from '@/schemas';
import { GetLocationByNameAsync } from '@/repo/location';

export const createLocation = async (values: z.infer<typeof LocationSchema>) => {
  const validatedField = LocationSchema.safeParse(values);

  if (!validatedField.success) {
    return { error: 'Invalid fields' };
  }

  const { name, managerId } = validatedField.data;

  const newLocName = name.toLowerCase();
  const finalName = newLocName.charAt(0).toUpperCase() + newLocName.slice(1);

  const existingLocation = await GetLocationByNameAsync(name);

  if (existingLocation) {
    return { error: 'Location with that name already exists!' };
  }

  if (managerId !== null) {
    const existingModerator = await db.location.findFirst({
      where: {
        managerId,
      },
    });

    if (existingModerator) {
      return { error: 'User is already a manager of another location!' };
    }
  }

  const createdLocation = await db.location.create({
    data: {
      name: finalName,
      managerId: managerId,
    },
  });

  if (managerId) {
    await db.user.update({
      where: {
        user_id: managerId,
      },
      data: { user_location_id: createdLocation.id },
    });
  }

  return {
    success: 'Location has been added successfully!',
  };
};
