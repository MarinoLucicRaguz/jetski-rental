import { db } from "@/lib/db";

export const getJetskiById =async (jetski_id:number) => {
    try{
        const jetSki = await db.jetski.findUnique({where:{jetski_id}});
        return jetSki;
    } catch{
        return null;
    }
}

export const getJetskiByName =async (jetski_registration:string) => {
    try{
        const jetSki = await db.jetski.findUnique(
            {
                where:{
                    jetski_registration
                }});
        return jetSki;
    } catch{
        return null;
    }
}

export const getLocationById = async(location_id:number) => {
    try {
        const location = await db.location.findUnique({
            where:{
                location_id
            }
        });
        return location;
    } catch{
        return null;
    }
}

export const getLocationNameById = async(location_id:number) => {
    try {
        const location = await db.location.findUnique({
            where:{
                location_id
            }
        });
        return location?.location_name;
    } catch{
        return null;
    }
}

export const getLocationByName = async(location_name:string) => {
    try {
        const location = await db.location.findUnique({
            where:{
                location_name
            }
        });
        return location;
    } catch{
        return null;
    }
}

export const fetchJetskis = async () => {
    try {
        const jetskis = await db.jetski.findMany();

        return jetskis;
    } catch(error) {
        console.log(error)
        return null
    }
}


export const fetchLocations = async () => {
    try {
        const locations = await db.location.findMany();

        return locations;
    } catch(error) {
        console.log(error)
        return null
    }
}


export const getAvailableJetskis = async (startTime: Date, endTime: Date) => {
    try {
        const availableJetskis = await db.jetski.findMany({
            where: {
                NOT: {
                    jetski_reservations: {
                        some: {
                            OR: [
                                { 
                                    // Check if the new reservation's start time is between existing reservation's start and end time
                                    AND: [
                                        { startTime: { lte: startTime } },
                                        { endTime: { gt: startTime } } // Use gt instead of gte
                                    ]
                                },
                                { 
                                    // Check if the new reservation's end time is between existing reservation's start and end time
                                    AND: [
                                        { startTime: { lt: endTime } }, // Use lt instead of lte
                                        { endTime: { gte: endTime } }
                                    ]
                                },
                                { 
                                    // Check if the existing reservation's start time is between new reservation's start and end time
                                    AND: [
                                        { startTime: { gte: startTime } },
                                        { startTime: { lt: endTime } } // Use lt instead of lte
                                    ]
                                },
                                { 
                                    // Check if the existing reservation's end time is between new reservation's start and end time
                                    AND: [
                                        { endTime: { gt: startTime } }, // Use gt instead of gte
                                        { endTime: { lte: endTime } }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        });

        return availableJetskis;
    } catch (error) {
        console.error('Error fetching available jet skis:', error);
        throw error;
    }
};


export const fetchUsers =async (user_id:string) => {
    try{
        const users = await db.user.findMany({where:{user_id}});
        return users;
    } catch(error){
        console.log(error)
        return null;
    }
}

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
        startOfDay.setHours(0, 0, 0, 0); // Set time to start of the day (midnight)

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999); // Set time to end of the day (just before midnight)

        console.log('Start of day:', startOfDay);
        console.log('End of day:', endOfDay);

        const reservations = await db.reservation.findMany({
            where: {
                AND: [
                    { startTime: { lte: endOfDay } }, // Reservations that start before or at the end of the provided day
                    { endTime: { gte: startOfDay } } // Reservations that end after or at the start of the provided day
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