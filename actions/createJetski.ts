"use server"
import { db } from "@/lib/db";
import * as z from "zod";

import { JetskiSchema } from "@/schemas";
import { getJetskiByName } from "@/data/jetskiData";

export const createJetski = async (values: z.infer<typeof JetskiSchema>) => {
    const validatedFields = JetskiSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields", success: undefined };
    }

    
    const { jetski_registration, jetski_location_id, jetski_topSpeed, jetski_kW, jetski_manufacturingYear, jetski_model } = validatedFields.data;
    const existingJetski = await getJetskiByName(jetski_registration);
    if (existingJetski) {
        return { error: "Jetski with that registration already exists!", success: undefined };
    }
    
    if (!jetski_location_id)
        {
        return {error: "Jetski dosen't have location. Please select valid location."};   
    }
    try {
        await db.jetski.create({
            data: {
                jetski_registration,
                jetski_location_id,
                jetski_topSpeed,
                jetski_kW,
                jetski_manufacturingYear,
                jetski_model,
            },
        });
        return { success: "Jetski has been added successfully!", error: undefined };
    } catch (error) {
        console.error("Error creating jetski:", error);
        return { error: "An error occurred while creating the jetski", success: undefined };
    }
};
