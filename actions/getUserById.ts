'use server';

import { getUserByid } from '@/repo/userData';

export const actionGetUserById = async (guid: string) => {
  const user = await getUserByid(guid);

  return user;
};
