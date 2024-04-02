"use server"

import { db } from "@/lib/db";
import * as z from "zod";

import { JetskiSchema } from "@/schemas";
import { getJetskiById } from "@/data/jetskiData";

export const editJetski = async (jetskiId: number, values: z.infer<typeof JetskiSchema>) => {
    const validatedFields = JetskiSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }


    const { jetski_registration, jetski_location_id } = validatedFields.data;

    const doesJetskiExist = await getJetskiById(jetskiId);
    console.log(jetskiId)
    console.log(doesJetskiExist)
    if (!doesJetskiExist) {
        
        return { error: "Jetski not found" };
    }

    try {
        await db.jetski.update({
            where: { jetski_id: jetskiId },
            data: { jetski_registration, jetski_location_id }
        });

        return { success: "Jetski successfully updated" };
    } catch (error) {
        return { error: "Failed to update jetski" };
    }
};
