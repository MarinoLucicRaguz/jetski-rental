"use server";

import { getUserByid } from "@/data/userData";

export const actionGetUserById = async(guid: string)=>{
    const user = await getUserByid(guid)

    return user;
}