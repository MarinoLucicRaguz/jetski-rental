"use server";

import { getAuthenticatedUsers } from "@/data/userData";

export const getAuthUsers = async()=>{
    const users = await getAuthenticatedUsers()

    return users;
}
