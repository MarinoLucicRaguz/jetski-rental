import { db } from '@/lib/db';

export const GetLocationAsync = async () => {
  try {
    const locations = await db.location.findMany();
    return locations;
  } catch (error) {
    return null;
  }
};

export const GetLocationByIdAsync = async (id: number) => {
  try {
    const location = await db.location.findUnique({
      where: {
        id,
      },
    });
    return location;
  } catch {
    return null;
  }
};

export const GetLocationNameByIdAsync = async (id: number) => {
  try {
    const location = await db.location.findUnique({
      where: {
        id,
      },
    });
    return location?.name;
  } catch {
    return null;
  }
};

export const GetLocationByNameAsync = async (name: string) => {
  try {
    const location = await db.location.findUnique({
      where: {
        name,
      },
    });
    return location;
  } catch {
    return null;
  }
};
