import bcryptjs from "bcryptjs"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { LoginSchema } from "./schemas"
import { getUserByEmail } from "./data/user";

//login schema check da nebi netko pokusao bypasat
export default {
  providers: [Credentials({
    async authorize(credentials){
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success){
            const {email,password} = validatedFields.data;

            const user = await getUserByEmail(email);
            if (!user || !user.password) return null; //mogu se logirati ako koriste google il github login (mi to nemamo, ali precaution)

            const passwordMatch = await bcryptjs.compare(
                password,
                user.password,
            );


            if (passwordMatch){
                return user;
            }
        }

        return null;
    }
  })],
} satisfies NextAuthConfig