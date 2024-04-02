"use server";

import { getAllJetskis } from "@/data/jetskiData";

export const listJetski = async()=>{
    const listJetskis = await getAllJetskis()

    return listJetskis
}