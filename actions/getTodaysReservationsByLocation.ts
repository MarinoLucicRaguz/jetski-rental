"use server";

import { getReservationByLocation } from "@/data/reservationData";


export const getTodayReservationByLocation = async( location_id: number)=>{
    const reservationData = await getReservationByLocation(location_id)

    return reservationData;
}