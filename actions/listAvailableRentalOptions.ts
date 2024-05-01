"use server";

import { getAllRentalOptionsThatAreAvailable } from "@/data/rentalOptionData";


export const getAvailableReservationOptions = async()=>{
    const listReservationOptions = await getAllRentalOptionsThatAreAvailable()

    return listReservationOptions
}