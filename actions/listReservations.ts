"use server";

import { fetchReservations } from "@/data/jetski";

export const getAllReservations = async()=>{
    const listReservations = await fetchReservations()

    return listReservations
}