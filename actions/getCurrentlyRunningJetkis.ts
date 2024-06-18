"use server";
import { checkWhichJetskisAreCurrentlyRunning } from "@/data/reservationData";

export const getCurrentlyRunningJetskis = async()=>{
    const jetskis = await checkWhichJetskisAreCurrentlyRunning();

    return jetskis;
}