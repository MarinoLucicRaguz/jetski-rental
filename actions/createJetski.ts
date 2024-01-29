"use server";
import { db } from "@/lib/db";
import * as z from "zod";

import { JetskiSchema } from "@/schemas";
import { getJetskiByName } from "@/data/jetski";


export const createJetski = async( values: z.infer<typeof JetskiSchema>)=>{
    const validatedField = JetskiSchema.safeParse(values);

    if (!validatedField.success){
        return {error:"Invalid fields"};
    }

    const { jetski_registration, jetski_status } = validatedField.data;

    const existingJetski = await getJetskiByName(jetski_registration)

    if (existingJetski){
        return {error: "Jetski with that registration already exists!!!"};
    };

    await db.jetski.create({
        data:{
            jetski_registration,
        }
    })

    return {
        success: "Jetski has been added successfully!"
    }
}