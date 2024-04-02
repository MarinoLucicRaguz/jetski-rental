import { db } from "@/lib/db";

export const fetchAllLocations = async () => {
    try {
        const locations = await db.location.findMany();
        return locations;
    } catch(error) {
        console.log(error)
        return null
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