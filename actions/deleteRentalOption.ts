"use server";

import { getRentalOptionById } from "@/data/rentalOptionData";
import { findReservationUsingRentalOption } from "@/data/reservationData";
import { db } from "@/lib/db";

export const deleteRentalOption = async (rentalOptionId: number) => {
    const existingRentalOption = await getRentalOptionById(rentalOptionId);

    const reservationWhereItIsUsed = await findReservationUsingRentalOption(rentalOptionId);

    if(reservationWhereItIsUsed)
    {
     return { error: "This rental option is currently used. Please first remove it from all reservations first."}   
    }

    if (!existingRentalOption) {
        return { error: "Rental option with this ID does not exist!" };
    }

    try {
        const updatedIsAvailable = !existingRentalOption.isAvailable;

        await db.rentalOptions.update({
            where: { rentaloption_id: rentalOptionId },
            data: { isAvailable: updatedIsAvailable }
        });

        return { success: "Rental option has been deleted successfully!" };
    } catch (error) {
        return { error: "Failed to delete rental option!" };
    }
};
