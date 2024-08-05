"use server";

import { db } from "@/lib/db";
import * as z from "zod";
import { EditUserSchema } from "@/schemas";

export const editUser = async (user_id: string, values: z.infer<typeof EditUserSchema>) => {
    try {
        // Validate input fields against schema
        const validatedFields = EditUserSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: "Invalid fields" };
        }
        
        const { name, email, user_role, user_location_id, contactNumber } = validatedFields.data;

        const existingUser = await db.user.findUnique({ where: { user_id } });

        if (!existingUser) {
            return { error: "User not found" };
        }

        const managedLocation = await db.location.findFirst({
            where: {
                location_manager_id: user_id,
            },
        });

        if (user_role === "MODERATOR" && user_location_id===null)
        {
            return { error: "Moderator should have a location set!", success: undefined };
        }

        if (user_location_id && user_role==="MODERATOR") {
            const locationWithManager = await db.location.findUnique({ where: { location_id: user_location_id } });

            if (!locationWithManager) {
                return { error: "Location not found. Please choose another location." };
            }

            if (locationWithManager.location_manager_id !== user_id && locationWithManager.location_manager_id!==null) {
                return { error: "Location already has a manager. Please choose another location or remove the current manager." };
            }
        }

        const currentManagedLocation = managedLocation ? managedLocation.location_id : null;

        if (currentManagedLocation && currentManagedLocation !== user_location_id) {
            await db.location.update({
                where: { location_id: currentManagedLocation },
                data: {
                    location_manager_id: null,
                },
            });
        }

        if (currentManagedLocation && existingUser.user_role === "MODERATOR" && user_role !== "MODERATOR") {
            await db.location.update({
                where: { location_id: currentManagedLocation },
                data: {
                    location_manager_id: null,
                },
            });
        }


        await db.user.update({
            where: { user_id },
            data: {
                name,
                email,
                user_role,
                user_location_id,
                contactNumber,
            },
        });

        if (user_role === "MODERATOR" && user_location_id) {
            await db.location.update({
                where: { location_id: user_location_id },
                data: {
                    location_manager_id: user_id,
                },
            });
        }

        return { success: "User successfully updated" };
    } catch (error) {
        console.error("Error updating user:", error);
        return { error: "Failed to update user" };
    }
};
