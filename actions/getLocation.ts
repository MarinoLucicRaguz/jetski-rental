"use server";

import { getLocationById } from "@/data/locationData";

export const pullLocationById = async(locationId: number)=>{
    const location = await getLocationById(locationId);

    return location;
}