import React, { useEffect, useState } from "react";
import { Location, User, UserRole, UserStatus } from "@prisma/client";
import { listLocation } from "@/actions/listLocations";
import { Button } from "./button";

interface UserCardProps {
  user: User;
  onSave: (editedUser: Partial<User>) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSave }) => {
  const [editedUser, setEditedUser] = useState<Partial<User>>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await listLocation();
        if (data) setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedUser);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="user-card p-4 border rounded-lg shadow-md">
      {isEditing ? (
        <>
          <input
            type="text"
            name="name"
            value={editedUser.name || ""}
            onChange={handleChange}
            className="block w-full p-2 mb-2 border rounded"
          />
          <input
            type="email"
            name="email"
            value={editedUser.email || ""}
            onChange={handleChange}
            className="block w-full p-2 mb-2 border rounded"
          />
          <select
            name="user_status"
            value={editedUser.user_status}
            onChange={handleChange}
            className="block w-full p-2 mb-2 border rounded"
          >
            {Object.values(UserStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            name="user_role"
            value={editedUser.user_role}
            onChange={handleChange}
            className="block w-full p-2 mb-2 border rounded"
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            name="user_location_id"
            value={editedUser.user_location_id || ""}
            onChange={(e) => setEditedUser((prevUser) => ({ ...prevUser, user_location_id: Number(e.target.value) }))}
            className="block w-full p-2 mb-2 border rounded"
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.location_id} value={location.location_id}>
                {location.location_name}
              </option>
            ))}
          </select>
          <div className="flex justify-between">
            <Button onClick={handleSave} variant={"constructive"}>
              Save
            </Button>
            <Button onClick={cancelEdit} variant={"destructive"}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Status: {user.user_status}</p>
          <p>Role: {user.user_role}</p>
          <p>
            Location:{" "}
            {locations.find((location) => location.location_id === user.user_location_id)?.location_name || "N/A"}
          </p>
          <button onClick={handleEdit} className="px-4 py-2 mt-2 text-white bg-blue-500 rounded-lg">
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default UserCard;
