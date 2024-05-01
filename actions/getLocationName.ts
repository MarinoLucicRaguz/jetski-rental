"use server";

import { getLocationNameById } from "@/data/locationData";

export const getLocationName = async(locationId: number)=>{
    const location_name = await getLocationNameById(locationId);

    return location_name;
}