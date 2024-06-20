"use server";

import { getModerators } from "@/data/userData";

export const getModUsers = async()=>{
    const users = await getModerators()

    return users;
}
