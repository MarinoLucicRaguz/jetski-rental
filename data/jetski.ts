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
        const jetSki = await db.jetski.findUnique({where:{jetski_registration}});
        return jetSki;
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
        console.log(jetskis);
        return jetskis;
    } catch(error) {
        console.log(error)
        return null
    }
}