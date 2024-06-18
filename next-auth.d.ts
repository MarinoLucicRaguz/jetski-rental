import NextAuth, {DefaultSession} from "next-auth"
import { UserRole, UserStatus } from "@prisma/client";

declare module 'next-auth/react' {
	function getCsrfToken(): Promise<string>
}

export type ExtendedUser = DefaultSession["user"] &{
    role: UserRole;
    status: UserStatus;
    location_id: number;
}

declare module "next-auth"{
    interface Session {
        user: ExtendedUser;
    }
}
