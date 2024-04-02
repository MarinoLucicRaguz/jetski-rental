"use server";

import { getAvailableJetskis } from "@/data/jetskiData";

export const listAvailableJetskis = async(startTime: Date,endTime: Date)=>{
    const jetskis = await getAvailableJetskis(startTime,endTime)

    return jetskis
}