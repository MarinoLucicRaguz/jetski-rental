import { db } from '@/lib/db';

const orderByOptions = [{ description: 'asc' as const }, { duration: 'asc' as const }];

export const GetAllRentalOptionsAsync = async () => {
  try {
    const allRentalOptions = await db.rentalOption.findMany({
      orderBy: orderByOptions,
    });
    return allRentalOptions;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const GetActiveRentalOptionsAsync = async () => {
  try {
    const allRentalOptions = await db.rentalOption.findMany({
      where: {
        status: true,
      },
      orderBy: orderByOptions,
    });
    return allRentalOptions;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const GetRentalOptionByIdAsync = async (id: number) => {
  try {
    const rentalOption = await db.rentalOption.findUnique({
      where: {
        id,
      },
    });
    return rentalOption;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const DisableRentalOptionAsync = async (id: number) => {
  try {
    const rentalOption = await db.rentalOption.update({
      where: {
        id,
      },
      data: {
        status: false,
      },
    });
    return rentalOption;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const GetRentalOptionByDurationAsync = async (duration: number) => {
  try {
    const rentalOptions = await db.rentalOption.findMany({
      where: {
        duration,
      },
      orderBy: orderByOptions,
    });
    console.log(rentalOptions);
    return rentalOptions;
  } catch (error) {
    console.log(error);
    return null;
  }
};
