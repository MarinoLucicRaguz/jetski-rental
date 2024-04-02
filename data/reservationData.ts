import { db } from "@/lib/db";

export const fetchReservations = async() =>{
    try{
        const reservations = await db.reservation.findMany({
            include: {
                reservation_jetski_list: true,
                reservation_location: true,
            }
        });
        return reservations;
    } catch(error)
    {
        console.log(error);
        return null;
    }
}

export const fetchReservationsByDate = async (date: Date) => {
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

export type Reservation = {
    reservation_id: number;
    startTime: Date;
    endTime: Date;
    jetskiCount: number;
    safariTour: boolean;
    createdAt: Date;
    reservation_location_id: number;
    reservation_location: {
        location_id: number;
        location_name: string;
    };
    reservation_jetski_list?: {
        jetski_id: number;
        jetski_registration: string;
    }[];
}