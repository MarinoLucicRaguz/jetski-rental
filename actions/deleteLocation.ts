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
        return { error: "Existing reservations are associated with this location." };
    }

    if (existingLocation.location_manager_id) {
        return { error: "A manager is assigned to this location." };
    }

    const assignedJetskis = await db.jetski.findMany({
        where: { jetski_location_id: locationId },
    });

    if (assignedJetskis.length > 0) {
        return { error: "Jetskis are assigned to this location." };
    }

    try {
        await db.location.delete({
            where: { location_id: locationId },
        });

        return { success: "Location deleted successfully!" };
    } catch (error) {
        console.error("Error deleting location:", error);
        return { error: "Failed to delete location!" };
    }
};
