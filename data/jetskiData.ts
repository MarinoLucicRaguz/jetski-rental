import { db } from "@/lib/db";

export const getJetskiById =async (jetski_id:number) => {
    try{
        const jetSki = await db.jetski.findUnique({where:{jetski_id}});
        return jetSki;
    } catch{
        return null;
    }
}

export const getJetskisByLocation =async (jetski_location_id:number) => {
    try{
        const jetSki = await db.jetski.findMany({where:{jetski_location_id}});
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

export const getAllJetskis = async () => {
    try {
        const jetskis = await db.jetski.findMany();

        return jetskis;
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
                                    AND: [
                                        { startTime: { lte: startTime } },
                                        { endTime: { gt: startTime } }
                                    ]
                                },
                                { 
                                    AND: [
                                        { startTime: { lt: endTime } }, 
                                        { endTime: { gte: endTime } }
                                    ]
                                },
                                { 
                                    AND: [
                                        { startTime: { gte: startTime } },
                                        { startTime: { lt: endTime } } 
                                    ]
                                },
                                { 
                                    AND: [
                                        { endTime: { gt: startTime } },
                                        { endTime: { lte: endTime } }
                                    ]
                                }
                            ]
                        }
                    }
                },
                jetski_status: "AVAILABLE"
            }
        });

        return availableJetskis;
    } catch (error) {
        console.error('Error fetching available jet skis:', error);
        throw error;
    }
};