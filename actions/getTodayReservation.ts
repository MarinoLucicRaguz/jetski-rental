"use server";

import { fetchTodayReservation } from "@/data/reservationData";

export const getTodayReservationData = async() =>{
    const reservationData = await fetchTodayReservation()

    return reservationData;
}