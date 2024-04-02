"use server";

import { getJetskiById } from "@/data/jetskiData";

export const getJetski = async(jetskiId: number)=>{
    const jetski = await getJetskiById(jetskiId)

    return jetski
}