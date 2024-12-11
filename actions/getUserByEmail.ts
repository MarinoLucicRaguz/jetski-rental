'use server';

import { getUserByEmail } from '@/repo/userData';

export const actionGetUserByEmail = async (email: string) => {
  const user = await getUserByEmail(email);

  return user;
};
