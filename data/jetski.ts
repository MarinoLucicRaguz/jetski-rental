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

export const fetchUsers =async (user_id:string) => {
    try{
        const users = await db.user.findMany({where:{user_id}});
        return users;
    } catch(error){
        console.log(error)
        return null;
    }
}

