"use server";

import { fetchReservations } from "@/data/reservationData";

export const getAllReservations = async()=>{
    const listReservations = await fetchReservations()

    return listReservations
}