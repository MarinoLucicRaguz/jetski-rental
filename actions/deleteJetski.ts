"use server";

import { db } from "@/lib/db";

import { getJetskiById } from "@/data/jetskiData";
import { statusJetski } from "@prisma/client";

export const deleteJetski = async (jetskiId: number) => {
    const existingJetski = await getJetskiById(jetskiId);

    if (!existingJetski) {
        return { error: "Jetski with this ID does not exist!" }; // Should never happen, but just in case!
    }
    
    let newStatus: statusJetski = "NOT_IN_FLEET";

    try {
        await db.jetski.update({
            where: { jetski_id: jetskiId },
            data: { jetski_status: newStatus }
        });

        return { success: "Jetski status updated successfully!" };
    } catch (error) {
        return { error: "Failed to update jetski status!" };
    }
};
