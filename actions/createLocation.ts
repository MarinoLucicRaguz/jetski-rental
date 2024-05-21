"use server";
import { db } from "@/lib/db";
import * as z from "zod";

import { LocationSchema } from "@/schemas";
import { getLocationByName } from "@/data/locationData";
import { getUserByid } from "@/data/userData";


export const createLocation = async( values: z.infer<typeof LocationSchema>)=>{
    const validatedField = LocationSchema.safeParse(values);

    if (!validatedField.success){
        return {error:"Invalid fields"};
    }

    const { location_name, user_id } = validatedField.data;

    const newLocName = location_name.toLowerCase();
    const finalName = newLocName.charAt(0).toUpperCase() + newLocName.slice(1);

    const exisitingLocation = await getLocationByName(location_name)

    if(user_id)
    {
        const user = await getUserByid(user_id)
    }

    if (exisitingLocation){
        return {error: "Location with that name already exists!"};
    };

    await db.location.create({
        data:{
            location_name: finalName,
            location_manager_id: user_id
        }
    })

    return {
        success: "Location has been added successfully!"
    }
}