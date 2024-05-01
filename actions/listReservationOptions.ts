"use server";

import { getAllRentalOptions } from "@/data/rentalOptionData";

export const getAllReservationOptions = async()=>{
    const listReservationOptions = await getAllRentalOptions()

    return listReservationOptions
}