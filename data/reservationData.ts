// data/reservationData.ts

import { db } from "@/lib/db";
import { ExtendedReservation } from "@/types";

export const fetchReservations = async (): Promise<ExtendedReservation[] | null> => {
    try {
        const reservations = await db.reservation.findMany({
            include: {
                reservation_jetski_list: true,
                reservation_location: true,
            }
        });
        return reservations;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const checkWhichJetskisAreCurrentlyRunning = async () => {
    try {
        const jetskis = await db.reservation.findMany({
            where: {
                isCurrentlyRunning: true
            },
            select: {
                reservation_jetski_list: true
            }
        });
        return jetskis.flatMap(reservation => reservation.reservation_jetski_list);
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const findReservationUsingRentalOption = async (rentaloption_id: number) => {
    try {
        const rentalOptions = await db.reservation.findFirst({
            where: {
                rentaloption_id
            }
        })

        return rentalOptions;
    } catch (error)
    {
        console.log(error);
        return null;
    }
}

export const getFirstReservationsByJetskiIds = async (jetski_ids: number[]): Promise<{ [key: number]: ExtendedReservation | null }> => {
    try {
        const now = new Date();

        const reservations = await db.reservation.findMany({
            where: {
                OR: [
                    {
                        isCurrentlyRunning: true,
                        reservation_jetski_list: { some: { jetski_id: { in: jetski_ids } } }
                    },
                    {
                        startTime: { gte: now },
                        reservation_jetski_list: { some: { jetski_id: { in: jetski_ids } } }
                    }
                ]
            },
            orderBy: {
                startTime: 'asc'
            },
            include: {
                reservation_jetski_list: true,
                reservation_location: true,
            },
        });

        const reservationMap: { [key: number]: ExtendedReservation | null } = {};
        jetski_ids.forEach(jetski_id => {
            const reservation = reservations.find(res =>
                res.reservation_jetski_list.some(jetski => jetski.jetski_id === jetski_id)
            );
            reservationMap[jetski_id] = reservation || null;
        });

        return reservationMap;
    } catch (error) {
        console.error("Error fetching reservations: ", error);
        return jetski_ids.reduce((acc, id) => ({ ...acc, [id]: null }), {});
    }
};


export const fetchTodayReservation = async(): Promise<ExtendedReservation[] | null> => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const reservations = await db.reservation.findMany({
            where: {
                AND: [
                    { startTime: { lte: endOfDay } },
                    { endTime: { gte: startOfDay } }
                ]
            },
            include: {
                reservation_jetski_list: true,
                reservation_location: true,
            }
        });

        console.log('Fetched reservations:', reservations);
        return reservations;
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return null;
    }
}

export const fetchReservationsByDate = async (date: Date): Promise<ExtendedReservation[] | null> => {
    try {
        console.log('Fetching reservations for date:', date );

        const startOfDay = new Date(date);

        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('Start of day:', startOfDay);
        console.log('End of day:', endOfDay);

        const reservations = await db.reservation.findMany({
            where: {
                AND: [
                    { startTime: { lte: endOfDay } },
                    { endTime: { gte: startOfDay } }
                ]
            },
            include: {
                reservation_jetski_list: true,
                reservation_location: true,
            }
        });

        console.log('Fetched reservations:', reservations);
        return reservations;
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return null;
    }
}

export const getReservationById = async (reservation_id: number): Promise<ExtendedReservation | null> => {
    try {
        const reservation = await db.reservation.findUnique({
            where: {
                reservation_id
            },
            include: {
                reservation_jetski_list: true,
                reservation_location: true,
            }
        });

        return reservation;
    } catch (error) {
        console.error("Unable to find the reservation: ", error);
        return null;
    }
}

export const getReservationByLocation = async (location_id: number): Promise<ExtendedReservation[] | null> => {
    try {
      const now = new Date();
  
      const fourHoursAgo = new Date(now);
      fourHoursAgo.setHours(now.getHours() - 4);
  
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
  
      console.log('Current time:', now);
      console.log('Four hours ago:', fourHoursAgo);
      console.log('End of day:', endOfDay);
  
      const reservations = await db.reservation.findMany({
        where: {
          reservation_location_id: location_id,
          startTime: {
            gte: fourHoursAgo,
            lte: endOfDay,
          },
        },
        orderBy: { startTime: 'asc' },
        include: {
          reservation_jetski_list: true,
          reservation_location: true,
        },
      });
  
      return reservations;
    } catch (error) {
      console.error("Unable to find reservations ", error);
      return null;
    }
  };
  
