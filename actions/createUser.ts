"use server";

import { db } from "@/lib/db";
import * as z from "zod";
import { CreateUserSchema, EditUserSchema } from "@/schemas";
import { UserStatus } from "@prisma/client";

export const createUser = async (values: z.infer<typeof CreateUserSchema>) => {
    const validatedFields = CreateUserSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields", success: undefined };
    }

    const { name, email, user_role, user_location_id, contactNumber, password } = validatedFields.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
        return { error: "User with that email already exists!", success: undefined };
    }

    if (user_role === "MODERATOR" && user_location_id===null)
    {
       return { error: "Moderator should have a location set!", success: undefined };
    }
    const user_status = UserStatus.ACTIVE;

    // Check if the user is trying to set a location where they are already a manager
    if (user_role === "MODERATOR" && user_location_id) {
        const locationWithManager = await db.location.findUnique({ where: { location_id: user_location_id } });
        if (locationWithManager && locationWithManager.location_manager_id !== null) {
            return { error: "Location already has a manager. Please choose another location or remove the current manager.", success: undefined };
        }
    }

    try {
        // Create user
        const newUser = await db.user.create({
            data: {
                name,
                email,
                user_role,
                user_status,
                user_location_id,
                contactNumber,
                password,
            },
        });

        // If the user's role is "MODERATOR", update the location to set them as manager
        if (user_role === "MODERATOR" && user_location_id) {
            await db.location.update({
                where: { location_id: user_location_id },
                data: {
                    location_manager_id: newUser.user_id,
                },
            });
        }

        return { success: "User has been added successfully!", error: undefined };
    } catch (error) {
        console.error("Error creating user:", error);
        return { error: "An error occurred while creating the user", success: undefined };
    }
};
