"use server";

import { fetchLocations } from "@/data/jetski";

export const listLocation = async()=>{
    const listLocations = await fetchLocations()

    return listLocations
}