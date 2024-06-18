"use server";

import { getJetskisByLocation } from "@/data/jetskiData";

export const listJetskisByLocation = async(location_id: number)=>{
    const jetski = await getJetskisByLocation(location_id)

    return jetski
}