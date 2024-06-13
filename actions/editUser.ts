"use server";
import { db } from "@/lib/db";
import * as z from "zod";
import { EditUserSchema } from "@/schemas";

export const editUser = async (user_id: string, values: z.infer<typeof EditUserSchema>) => {
    const validatedFields = EditUserSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }
    
    const { name, email, password, user_status, user_role, user_location_id, contactNumber } = validatedFields.data;

    try {
        const existingUser = await db.user.findUnique({ where: { user_id } });

        if (!existingUser) {
            return { error: "User not found" };
        }

        const emailExists = email ? await db.user.findUnique({ where: { email } }) : null;

        if (emailExists && emailExists.user_id !== user_id) {
            return { error: "Email already in use by another user" };
        }

        const managedLocation = await db.location.findFirst({
            where: {
                location_manager_id: user_id,
            },
        });

        if (managedLocation && managedLocation.location_id !== user_location_id) {
            return { error: "User is a manager of their current location and cannot be removed from it" };
        }

        await db.user.update({
            where: { user_id },
            data: {
                name,
                email,
                password,
                user_status,
                user_role,
                user_location_id,
                contactNumber,
            },
        });

        return { success: "User successfully updated" };
    } catch (error) {
        return { error: "Failed to update user", details: error };
    }
};
