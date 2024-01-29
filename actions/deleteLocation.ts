"use server";

import { db } from "@/lib/db";

import { getLocationById } from "@/data/jetski";

export const deleteLocation = async(locationId: number) => {

    const existingLocation = await getLocationById(locationId);

    if (!existingLocation) {
        return { error: "Location with this ID does not exist!" }; //Should never happen, but just incase!
    }

    try {
        await db.location.delete({
            where: { location_id: locationId }
        });

        return { success: "Location deleted succesfully!" };
    } catch (error) {
        return { error: "Failed to delete location!" };
    }
};
