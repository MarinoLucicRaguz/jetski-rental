"use server";

import { getUserByid } from "@/data/userData";
import { db } from "@/lib/db";

export const deleteUser = async (user_id: string) => {
    const user = await getUserByid(user_id);
    
    if (!user) {
        return { error: "User with this ID does not exist! Strip him of his role before attempting to delete him." };
    }

    try {
        if (user.user_role === "ADMIN") {
            return { error: "Cannot delete administrator!" };
        }

        const isManager = await db.location.findFirst({
            where: {
                location_manager_id: user_id
            }
        });

        if (isManager) {
            return { error: "Cannot delete user. They are a manager of a location!" };
        }

        await db.user.delete({
            where: {
                user_id
            }
        });

        return { success: "User deleted successfully!" };
    } catch (error) {
        return { error: "Failed to delete user!" };
    }
};
