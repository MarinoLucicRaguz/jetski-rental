"use server";
import { db } from "@/lib/db";
import * as z from "zod";
import { LocationSchema } from "@/schemas";
import { getLocationByName } from "@/data/locationData";

export const createLocation = async (values: z.infer<typeof LocationSchema>) => {
    const validatedField = LocationSchema.safeParse(values);

    if (!validatedField.success) {
        return { error: "Invalid fields" };
    }

    const { location_name, user_id } = validatedField.data;

    const newLocName = location_name.toLowerCase();
    const finalName = newLocName.charAt(0).toUpperCase() + newLocName.slice(1);

    const existingLocation = await getLocationByName(location_name);

    if (existingLocation) {
        return { error: "Location with that name already exists!" };
    }

    if (user_id !== null) {
        const existingModerator = await db.location.findFirst({
            where: {
                location_manager_id: user_id,
            },
        });

        if (existingModerator) {
            return { error: "User is already a manager of another location!" };
        }
    }

    const createdLocation = await db.location.create({
        data: {
            location_name: finalName,
            location_manager_id: user_id,
        },
    });

    if (user_id) {
        await db.user.update({
            where: {
                user_id: user_id,
            },
            data: { user_location_id: createdLocation.location_id },
        });
    }

    return {
        success: "Location has been added successfully!"
    };
};
