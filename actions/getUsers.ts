'use server';

import { getAllUsers } from '@/repo/userData';

export const getUsers = async () => {
  const users = await getAllUsers();

  return users;
};
