"use server";

import { getJetskiById } from "@/data/jetski";

export const getJetski = async(jetskiId: number)=>{
    const jetski = await getJetskiById(jetskiId)

    return jetski
}