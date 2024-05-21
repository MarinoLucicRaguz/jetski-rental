import { db } from "@/lib/db";

export const getUserByEmail =async (email:string) => {
    try{
        const user = await db.user.findUnique({where:{email}});
        return user;
    } catch{
        return null;
    }
}

export const getUserByid =async (id:string) => {
    try{
        const user = await db.user.findUnique({where:{user_id: id}});
        return user;
    } catch{
        return null;
    }
}

export const getAllUsers = async()=>{
    try{
        const users = await db.user.findMany()

        return users;
    } catch {
        return null;
    }
}
export const getAuthenticatedUsers = async()=>{
    try{
        const users = await db.user.findMany({
            where: {
                OR: [
                    {user_role: "ADMIN"},
                    {user_role: "MODERATOR"}
                ]
            }
        })

        return users;
    } catch {
        return null;
    }
}