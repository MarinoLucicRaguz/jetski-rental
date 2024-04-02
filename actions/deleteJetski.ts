"use server";

import { db } from "@/lib/db";

import { getJetskiById } from "@/data/jetskiData";

export const deleteJetski = async(jetskiId: number) => {

    const existingJetski = await getJetskiById(jetskiId);

    if (!existingJetski) {
        return { error: "Jetski with this ID does not exist!" }; //Should never happen, but just incase!
    }

    try {
        await db.jetski.delete({
            where: { jetski_id: jetskiId }
        });

        return { success: "Jetski deleted succesfully!" };
    } catch (error) {
        return { error: "Failed to delete jetski!" };
    }
};
