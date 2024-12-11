'use server';

import { GetUsersWithAdditionalRights } from '@/repo/userData';

export const getModUsers = async () => {
  const users = await GetUsersWithAdditionalRights();

  return users;
};
