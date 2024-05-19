"use server";

import { getAllUsers } from "@/data/userData";

export const getUsers = async()=>{
    const users = await getAllUsers()

    return users;
}