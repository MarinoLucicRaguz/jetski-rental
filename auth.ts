import NextAuth, { Session } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole, UserStatus } from "@prisma/client";
import { getUserByEmail, getUserByid } from "./data/userData";
import { db } from "./lib/db";
import authConfig from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
    callbacks:{
      async session({ session, token }){
        if (token.sub && session.user) {
          session.user.id = token.sub;
        }
        if (token.role && session.user){
          session.user.role = token.role as UserRole;
        }
        if (token.status && session.user){
          session.user.status = token.status as UserStatus;
        }
        return session;
      },
      async jwt({ token, user }){
        if (!token.sub) {
          return token;
        }

        if (!token.email) {
          console.log("Token email is undefined, returning token.");
          return token;
        }

        const existingUser = await getUserByEmail(token.email);
        if (!existingUser) {
          return token;
        }
        token.role = existingUser.user_role;
        token.status = existingUser.user_status;
        return token;
      }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig,
});
