"use server";
import { db } from "@/lib/db";
import * as z from "zod";

import { LocationSchema } from "@/schemas";
import { getLocationByName } from "@/data/jetskiData";


export const createLocation = async( values: z.infer<typeof LocationSchema>)=>{
    const validatedField = LocationSchema.safeParse(values);

    if (!validatedField.success){
        return {error:"Invalid fields"};
    }

    const { location_name } = validatedField.data;

    const existingJetski = await getLocationByName(location_name)

    if (existingJetski){
        return {error: "Location with that name already exists!"};
    };

    await db.location.create({
        data:{
            location_name,
        }
    })

    return {
        success: "Location has been added successfully!"
    }
}