"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorPopup from "../ui/errorpopup";
import { CardWrapper } from "../auth/card-wrapper";
import { Location, User, UserRole } from "@prisma/client";
import { getUsers } from "@/actions/getUsers";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { deleteUser } from "@/actions/deleteUser";
import { Button } from "../ui/button";
import { listLocation } from "@/actions/listLocations";

const convertUserRole = (userRole: UserRole): string => {
  switch (userRole) {
    case "ADMIN":
      return "Administrator";
    case "MODERATOR":
      return "Manager";
    case "USER":
      return "Worker";
    case "GUEST":
      return "New user";
    default:
      return "Unknown role";
  }
};

const AdminDashboard = () => {
  const user = useCurrentUser();
  const [showError, setShowError] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]| null>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getUsers();
        if (users) {
          setUsers(users);
        }
        const locations = await listLocation();
        setLocations(locations);
      } catch (error) {
        setError("Error while fetching users.");
        console.error("Failed to fetch data: ", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      setShowError(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [user, router]);

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

  const handleEditUser = (userId: string) => {
    router.push(`/admindashboard/${userId}/edituser/`);
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
      <div>
      <Button className="p-3 mb-2" onClick={() => router.push("/admindashboard/createuser")}>
        Create new user
      </Button>
      </div>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 rounded-sm">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Contact</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.user_id} className="bg-white border-b">
                <td className="px-6 py-3">{user.name}</td>
                <td className="px-6 py-3">{user.email}</td>
                <td className="px-6 py-3">{user.contactNumber}</td>
                <td className="px-6 py-3">{convertUserRole(user.user_role)}</td>
                <td className="px-6 py-3">{locations?.find(location => location.location_id===user.user_location_id)?.location_name || "No location"}</td>
                <td className="px-6 py-3 flex space-x-2">
                  <Button
                    className="ml-2"
                    onClick={() => handleEditUser(user.user_id)}
                    variant="default"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="ml-2"
                    onClick={() => handleDeleteUser(user.user_id)}
                  >
                    Delete
                  </Button>
                </td>
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
