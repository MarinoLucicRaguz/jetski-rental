"use server";

import { getLocationById } from "@/data/locationData";
import { db } from "@/lib/db";

export const deleteLocation = async (locationId: number) => {
    const existingLocation = await getLocationById(locationId);

    if (!existingLocation) {
        return { error: "Location with this ID does not exist!" };
    }

    const existingReservations = await db.reservation.findMany({
        where: { reservation_location_id: locationId },
    });

    if (existingReservations.length > 0) {
        return { error: "ExistingReservations" };
    }

    try {
        await db.location.delete({
            where: { location_id: locationId },
        });

        return { success: "Location deleted successfully!" };
    } catch (error) {
        return { error: "Failed to delete location!" };
    }
};
