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

export const fetchReservationsByDate = async (date: Date): Promise<ExtendedReservation[] | null> => {
    try {
        console.log('Fetching reservations for date:', date);

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
