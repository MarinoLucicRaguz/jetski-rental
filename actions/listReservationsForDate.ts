"use server";

import { fetchReservationsByDate } from "@/data/reservationData";

export const listReservationsByDate = async(date: Date)=>{
    const reservationsByDate = await fetchReservationsByDate(date)

    return reservationsByDate
}