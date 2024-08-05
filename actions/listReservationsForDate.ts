"use server";

import { fetchReservationsByDate } from "@/data/reservationData";
import { DateTime } from "luxon";

export const listReservationsByDate = async (date: Date) => {
    
    const adjustedDate = DateTime.fromJSDate(date).plus({ hours: 2 }).toJSDate();
    
    const reservationsByDate = await fetchReservationsByDate(adjustedDate);

    return reservationsByDate;
}
