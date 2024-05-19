// components/admin/admin-dashboard.tsx
"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorPopup from "../ui/errorpopup";
import { CardWrapper } from "../auth/card-wrapper";
import { User } from "@prisma/client";
import { getUsers } from "@/actions/getUsers";
import UserCard from "../ui/usercard";
import { editUser } from "@/actions/editUser";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

const AdminDashboard = () => {
  const user = useCurrentUser();
  const [showError, setShowError] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        if (users) {
          setUsers(users);
        }
      } catch (error) {
        setError("Error while fetching users.");
        console.error("Failed to fetch data: ", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      setShowError(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [user, router]);

  const handleSaveUser = async (editedUser: Partial<User>) => {
    try {
      const response = await editUser(editedUser.user_id as string, editedUser);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("User successfully updated");
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.user_id === editedUser.user_id ? { ...u, ...editedUser } : u))
        );
      }
    } catch (error) {
      setError("Failed to update user.");
      console.error("Error updating user: ", error);
    }
  };

  if (user && user.role !== "ADMIN") {
    return (
      <>
        {showError && (
          <ErrorPopup
            message="You need to be administrator to view this page."
            onClose={() => setShowError(false)}
          />
        )}
      </>
    );
  }

  return (
    <CardWrapper headerLabel="Admin dashboard" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
      <div className="space-y-2">
        {users ? (
          users.map((user) => (
            <UserCard key={user.user_id} user={user} onSave={handleSaveUser} />
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
      <FormError message={error} />
      <FormSuccess message={success} />
    </CardWrapper>
  );
};

export default AdminDashboard;
