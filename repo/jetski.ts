import { db } from '@/lib/db';

export const GetJetskiByIdAsync = async (id: number) => {
  try {
    const jetSki = await db.jetski.findUnique({ where: { id } });
    return jetSki;
  } catch {
    return null;
  }
};

export const GetJetskiByLocationIdAsync = async (locationId: number) => {
  try {
    const jetSki = await db.jetski.findMany({
      where: { locationId },
    });
    return jetSki;
  } catch {
    return null;
  }
};

export const GetJetskiByRegistrationAsync = async (registration: string) => {
  try {
    const jetSki = await db.jetski.findUnique({
      where: {
        registration,
      },
    });
    return jetSki;
  } catch {
    return null;
  }
};

export const GetAllJetskisAsync = async () => {
  try {
    const jetskis = await db.jetski.findMany();
    return jetskis;
  } catch (error) {
    return null;
  }
};

const orderByOptions = [{ jetski_location_id: 'asc' as const }];

const BUFFER_MINUTES = 5;

export const getAvailableJetskis = async (startTime: Date, endTime: Date) => {
  const adjustedStartTime = new Date(startTime.getTime() - BUFFER_MINUTES * 60 * 1000);
  const adjustedEndTime = new Date(endTime.getTime() + BUFFER_MINUTES * 60 * 1000);

  try {
    const availableJetskis = await db.jetski.findMany({
      where: {
        NOT: {
          jetski_reservations: {
            some: {
              OR: [
                {
                  AND: [{ startTime: { lte: adjustedStartTime } }, { endTime: { gt: adjustedStartTime } }],
                },
                {
                  AND: [{ startTime: { lt: adjustedEndTime } }, { endTime: { gte: adjustedEndTime } }],
                },
                {
                  AND: [{ startTime: { gte: adjustedStartTime } }, { startTime: { lt: adjustedEndTime } }],
                },
                {
                  AND: [{ endTime: { gt: adjustedStartTime } }, { endTime: { lte: adjustedEndTime } }],
                },
              ],
            },
          },
        },
        jetski_status: 'AVAILABLE',
      },
      orderBy: {
        jetski_id: 'asc',
      },
    });

    return availableJetskis;
  } catch (error) {
    console.error('Error fetching available jet skis:', error);
    throw error;
  }
};
