import { db } from '@/lib/db';

const orderByOptions = [{ rentaloption_description: 'asc' as const }, { duration: 'asc' as const }];

export const getAllRentalOptionsAsync = async () => {
  try {
    const allRentalOptions = await db.rentalOptions.findMany({
      orderBy: orderByOptions,
    });
    return allRentalOptions;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAllRentalOptionsThatAreAvailable = async () => {
  try {
    const allRentalOptions = await db.rentalOptions.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: orderByOptions,
    });
    return allRentalOptions;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getRentalOptionById = async (id: number) => {
  try {
    const rentalOption = await db.rentalOptions.findUnique({
      where: {
        rentaloption_id: id,
      },
    });
    return rentalOption;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const disableRentalOption = async (id: number) => {
  try {
    const rentalOption = await db.rentalOptions.update({
      where: {
        rentaloption_id: id,
      },
      data: {
        isAvailable: false,
      },
    });
    return rentalOption;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getRentalOptionByDuration = async (duration: number) => {
  try {
    const rentalOptions = await db.rentalOptions.findMany({
      where: {
        duration,
      },
      orderBy: orderByOptions,
    });
    return rentalOptions;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const doesDurationExist = async (duration: number) => {
  try {
    const doesItExist = await db.rentalOptions.findMany({
      where: {
        duration,
      },
    });
    return doesItExist.length > 0;
  } catch (error) {
    console.log(error);
    return null;
  }
};
