"use server";

import { fetchJetskis } from "@/data/jetski";


export const listJetski = async()=>{

    const listJetskis = await fetchJetskis()

    //console.log(listJetskis) //radi normalno
    return listJetskis
}