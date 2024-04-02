"use server";

import { fetchAllLocations } from "@/data/locationData";

export const listLocation = async()=>{
    const listLocations = await fetchAllLocations()

    return listLocations
}