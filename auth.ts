import NextAuth, { Session } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client";

import { getUserByid } from "./data/user";
import { db } from "./lib/db";
import authConfig from "./auth.config";



export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
    callbacks:{
      async session({session, token }:{ session: Session; token?: any}){
        console.log({
          sessionToken: token,
        })
        if (token.sub && session.user) {
          session.user.id = token.sub;
        }
        
        if (token.role && session.user){
          session.user.role = token.role as UserRole;
        }
        return session;
      },
      async jwt({ token }){
        if ( !token.sub ) {
          return token;
        }
        const existingUser = await getUserByid(token.sub);

        if( !existingUser ) {
          return token;
        }
        token.role = existingUser.user_role;

        return token;
      }
    },
    adapter:PrismaAdapter(db),
    session: {strategy: "jwt"}, //koristimo JWT inace ne radi na EDGE-u
    ...authConfig,
});

