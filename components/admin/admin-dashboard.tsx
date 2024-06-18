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
import { deleteUser } from "@/actions/deleteUser";

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
      const response = await editUser(editedUser.user_id as string, {
        ...editedUser,
        user_location_id: editedUser.user_location_id || null, 
      });
      if (response.error) {
        setError(response.error);
        setTimeout(() => setError(""), 1500);
      } else {
        setSuccess("User successfully updated");
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.user_id === editedUser.user_id ? { ...u, ...editedUser } : u))
        );
        setTimeout(() => setSuccess(""), 1500);
      }
    } catch (error) {
      setError("Failed to update user.");
      console.error("Error updating user: ", error);
      setTimeout(() => setError(""), 2500);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      if (response.error) {
        setError(response.error);
        setTimeout(() => setError(""), 1500);
      } else {
        setSuccess("User deleted successfully.");
        setUsers((prevUsers) => prevUsers.filter((u) => u.user_id !== userId));
        setTimeout(() => setSuccess(""), 1500);
      }
    } catch (error) {
      setError("Failed to delete user.");
      console.error("Error deleting user: ", error);
      setTimeout(() => setError(""), 2500);
    }
  };

  if (user && user.role !== "ADMIN") {
    return (
      <>
        {showError && (
          <ErrorPopup
            message="You need to be an administrator to view this page."
            onClose={() => setShowError(false)}
          />
        )}
      </>
    );
  }

  return (
    <CardWrapper className="w-full" headerLabel="Admin dashboard" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 rounded-sm">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Contact</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Locations</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.user_id} className="bg-white border-b">
                <UserCard user={user} onSave={handleSaveUser} onDelete={() => handleDeleteUser(user.user_id)} />
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-center p-5">
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
      </div>
    </CardWrapper>
  );
};

export default AdminDashboard;
