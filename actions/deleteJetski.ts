"use server";

import { db } from "@/lib/db";

import { getJetskiById } from "@/data/jetskiData";

export const deleteJetski = async (jetskiId: number) => {
    const existingJetski = await getJetskiById(jetskiId);

    if (!existingJetski) {
        return { error: "Jetski with this ID does not exist!" };
    }

    try {
        await db.jetski.update({
            where: { jetski_id: jetskiId },
            data: { jetski_status: "NOT_IN_FLEET" }
        });

        return { success: "Jetski status updated successfully!" };
    } catch (error) {
        return { error: "Failed to update jetski status!" };
    }
};
