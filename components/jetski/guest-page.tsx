"use client";

import AwaitPermission from "@/components/ui/awaitpermission";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useState } from "react";
import { signOutUser } from "@/actions/signOutAction";
import { Button } from "@/components/ui/button";

export const GuestPage = () => {
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (user && user.role !== "GUEST" && user.status!=="NOT_EMPLOYED") {
      router.push("/dashboard");
    } else if (user && user.role === "GUEST" || user?.status==="NOT_EMPLOYED") {
      setShowError(true);
    }
  }, [user, router]);

  const handleLogout = async () => {
    await signOutUser();
  };

  if (showError) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-yellow-500 bg-opacity-75 text-white">
        <AwaitPermission message="You need to be granted rights to view this page." />
        <Button onClick={handleLogout} variant="secondary" className="mt-4">
          Logout
        </Button>
      </div>
    );
  }

  return null;
};

export default GuestPage;