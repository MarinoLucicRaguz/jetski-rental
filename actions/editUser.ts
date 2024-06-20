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

        // Check if the user exists
        const existingUser = await db.user.findUnique({ where: { user_id } });

        if (!existingUser) {
            return { error: "User not found" };
        }

        // Check if the user is a manager of their current location
        const managedLocation = await db.location.findFirst({
            where: {
                location_manager_id: user_id,
            },
        });

        if (user_role === "MODERATOR" && user_location_id===null)
        {
            return { error: "Moderator should have a location set!", success: undefined };
        }

        // Check if the new location already has a manager
        if (user_location_id && user_role==="MODERATOR") {
            const locationWithManager = await db.location.findUnique({ where: { location_id: user_location_id } });

            // If locationWithManager is null, the location doesn't exist
            if (!locationWithManager) {
                return { error: "Location not found. Please choose another location." };
            }

            if (locationWithManager.location_manager_id !== user_id && locationWithManager.location_manager_id!==null) {
                return { error: "Location already has a manager. Please choose another location or remove the current manager." };
            }
        }

        // Check if the user is currently managing any location
        const currentManagedLocation = managedLocation ? managedLocation.location_id : null;

        // If user is managing a location and is moving to a new location
        if (currentManagedLocation && currentManagedLocation !== user_location_id) {
            // Update the current managed location to remove this user as manager
            await db.location.update({
                where: { location_id: currentManagedLocation },
                data: {
                    location_manager_id: null,
                },
            });
        }

        if (currentManagedLocation && existingUser.user_role === "MODERATOR" && user_role !== "MODERATOR") {
            // Remove user as manager from current managed location
            await db.location.update({
                where: { location_id: currentManagedLocation },
                data: {
                    location_manager_id: null,
                },
            });
        }


        // Update user details
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

        // If the user's new role is "MODERATOR", update the location to set them as manager
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
