"use server";

import { db } from "@/lib/db";
import { hash, compare } from "bcryptjs";

interface UpdateUserDetailsParams {
  email: string;
  name: string;
  currentPassword: string;
  newPassword: string;
}

export const updateUserDetails = async ({ email, name, currentPassword, newPassword }: UpdateUserDetailsParams) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return { error: "User not found" };
    }

    const passwordMatch = await compare(currentPassword, user.password);
    if (!passwordMatch) {
      return { error: "Current password is incorrect" };
    }

    const hashedNewPassword = await hash(newPassword, 10);

    const updatedUser = await db.user.update({
      where: { email },
      data: {
        name,
        password: hashedNewPassword,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    return { error: "Internal server error" };
  }
};
