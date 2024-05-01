"use server";

import { getRentalOptionById } from "@/data/rentalOptionData";
import { db } from "@/lib/db";

export const deleteRentalOption = async (rentalOptionId: number) => {
    const existingRentalOption = await getRentalOptionById(rentalOptionId);

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
