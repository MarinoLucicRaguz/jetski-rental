import { auth } from "@/auth";

export const getUserRole = async (): Promise<string> => {
  const session = await auth();
  return session?.user?.role || "GUEST";
};
