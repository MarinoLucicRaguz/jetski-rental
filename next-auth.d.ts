import NextAuth, {DefaultSession} from "next-auth"
import { UserRole, UserStatus } from "@prisma/client";

export type ExtendedUser = DefaultSession["user"] &{
    role: UserRole;
    status: UserStatus;
}

declare module "next-auth"{
    interface Session {
        user: ExtendedUser;
    }
}
