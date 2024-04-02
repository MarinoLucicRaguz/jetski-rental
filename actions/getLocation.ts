"use server";

import { getLocationById } from "@/data/locationData";

export const pullLocationById = async(locationId: number)=>{
    const location_name = await getLocationById(locationId);

    return location_name;
}