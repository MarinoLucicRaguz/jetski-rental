"use server";

import { getUserByEmail } from "@/data/userData";


export const actionGetUserByEmail = async(email: string)=>{
    const user = await getUserByEmail(email)

    return user;
}