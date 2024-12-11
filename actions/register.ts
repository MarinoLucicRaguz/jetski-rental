'use server';

import { db } from '@/lib/db';
import * as z from 'zod';
import bcryptjs from 'bcryptjs';
import { RegisterSchema } from '@/schemas';
import { getUserByEmail } from '@/repo/userData';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedField = RegisterSchema.safeParse(values);

  if (!validatedField.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password, name } = validatedField.data;
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return {
    success: 'Account has been created.',
  };
};
