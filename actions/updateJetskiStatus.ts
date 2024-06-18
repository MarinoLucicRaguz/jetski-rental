"use server";

import { db } from "@/lib/db";

import { getJetskiById } from "@/data/jetskiData";
import { statusJetski } from "@prisma/client";

export const updateJetskiStatus = async (jetskiId: number) => {
    const existingJetski = await getJetskiById(jetskiId);

    if (!existingJetski) {
        return { error: "Jetski with this ID does not exist!" }; // Should never happen, but just in case!
    }
    
    let newStatus: statusJetski = "NOT_AVAILABLE";

    if (existingJetski.jetski_status !== "AVAILABLE") {
        newStatus = "AVAILABLE";
    }

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
