"use server";

import { getLocationNameById } from "@/data/jetski";

export const getLocationNameAction = async(locationId: number)=>{
    const location_name = await getLocationNameById(locationId);

    return location_name;
}