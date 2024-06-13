"use server";
import { db } from "@/lib/db";
import * as z from "zod";

import { LocationSchema } from "@/schemas";
import { getLocationByName } from "@/data/locationData";

export const editLocation = async (locationId: number, values: z.infer<typeof LocationSchema>) => {
    const validatedFields = LocationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { location_name, user_id } = validatedFields.data;

    const newLocName = location_name.toLowerCase();
    const finalName = newLocName.charAt(0).toUpperCase() + newLocName.slice(1);

    const existingLocation = await getLocationByName(location_name);

    if (existingLocation && existingLocation.location_id !== locationId) {
        return { error: "Location with that name already exists" };
    }

    try {
        let locationDataToUpdate: any = { location_name: finalName };

        if (user_id !== null) {
            const existingModerator = await db.location.findFirst({
                where: {
                    location_manager_id: user_id,
                    NOT: {
                        location_id: locationId,
                    },
                },
            });

            if (existingModerator) {
                return { error: "User is already a manager of another location!" };
            }

            locationDataToUpdate.location_manager_id = user_id;
        } else {
            locationDataToUpdate.location_manager_id = null;
        }

        await db.location.update({
            where: { location_id: locationId },
            data: locationDataToUpdate,
        });

        if (user_id !== null) {
            await db.user.update({
                where: { user_id },
                data: { user_location_id: locationId },
            });
        }

        return { success: "Location successfully updated" };
    } catch (error) {
        return { error: "Failed to update location" };
    }
};
