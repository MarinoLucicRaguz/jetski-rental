"use client"

import { useSessionData } from "@/components/wrapper/useSessionData";

export const useCurrentUser = () => {
  const { data: session, status } = useSessionData();

  if (status === 'loading') {
    return null;
  }

  return session?.user;
};
