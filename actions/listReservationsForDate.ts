"use server";

import { fetchReservationsByDate } from "@/data/jetski";

export const listReservationsByDate = async(date: Date)=>{
    const reservationsByDate = await fetchReservationsByDate(date)

    return reservationsByDate
}