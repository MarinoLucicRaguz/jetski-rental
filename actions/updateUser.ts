"use server";

import { db } from "@/lib/db";
import { hash, compare } from "bcryptjs";

interface UpdateUserDetailsParams {
  email: string;
  name: string;
  currentPassword: string;
  newPassword: string;
  phone: string;
}

export const updateUserDetails = async ({ email, name, currentPassword, newPassword, phone }: UpdateUserDetailsParams) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return { error: "User not found" };
    }
    const passwordMatch = await compare(currentPassword, user.password);
    if (!passwordMatch) {
      return { error: "Current password is incorrect" };
    }

    const existingPhone = await db.user.findUnique({
      where: {
        contactNumber: phone,
        NOT: {
          user_id: user.user_id
        }
      }
    });
    

    if(existingPhone)
    {
      return { error: "Phone is already used by another worker. "}; 
    }

    const hashedNewPassword = await hash(newPassword, 10);

    const updatedUser = await db.user.update({
      where: { email },
      data: {
        name,
        password: hashedNewPassword,
        contactNumber: phone,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    return { error: "Internal server error" };
  }
};
