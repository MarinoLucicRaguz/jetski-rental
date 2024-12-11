'use server';

import { getAuthenticatedUsers } from '@/repo/userData';

export const getAuthUsers = async () => {
  const users = await getAuthenticatedUsers();

  return users;
};
