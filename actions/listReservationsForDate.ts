"use server";

import { fetchReservationsByDate } from "@/data/reservationData";
import { DateTime } from "luxon";

export const listReservationsByDate = async (date: Date) => {
    console.log("Checking information: ", date)
    const nextDayDate = DateTime.fromJSDate(date).plus({ days: 1 }).toJSDate();
    
    const reservationsByDate = await fetchReservationsByDate(nextDayDate);

    return reservationsByDate;
}
