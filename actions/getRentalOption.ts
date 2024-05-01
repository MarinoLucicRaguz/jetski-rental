"use server";

import { getRentalOptionById } from "@/data/rentalOptionData";

export const getRentalOption = async(rentalOptionId: number)=>{
    const rentalOption = await getRentalOptionById(rentalOptionId)

    return rentalOption
}