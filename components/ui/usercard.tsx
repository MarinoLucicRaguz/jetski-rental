import React, { useEffect, useState } from "react";
import { Location, User, UserRole } from "@prisma/client";
import { listLocation } from "@/actions/listLocations";
import { Button } from "./button";
import parsePhoneNumberFromString from "libphonenumber-js";
import { PhoneInput } from "react-international-phone";

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

interface UserCardProps {
  user: User;
  onSave: (editedUser: Partial<User>) => void;
  onDelete: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSave, onDelete }) => {
  const [editedUser, setEditedUser] = useState<Partial<User>>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [phone, setPhone] = useState<string>(user.contactNumber || "");
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(true); 
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await listLocation();
        if (data) {
          setLocations(data);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (value: string) => {
    setPhone(value);

    const phoneNumber = parsePhoneNumberFromString(value);
    setIsValidPhoneNumber(phoneNumber ? phoneNumber.isValid() : false);
  };

  const handleSave = () => {
    if (!isValidPhoneNumber) {
      setIsFormValid(false);
      return;
    }

    setIsFormValid(true);
    const editedUserWithPhone = {
      ...editedUser,
      contactNumber: phone,
    }
    onSave(editedUserWithPhone);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsFormValid(true);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    onDelete();
  };

  return (
    <>
      <td>
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={editedUser.name || ""}
            onChange={(e) =>
              setEditedUser((prevUser) => ({
                ...prevUser,
                name: e.target.value,
              }))
            }
            className="border border-gray-300 rounded-md p-2"
          />
        ) : (
          user.name
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={editedUser.email || ""}
            onChange={(e) =>
              setEditedUser((prevUser) => ({
                ...prevUser,
                email: e.target.value,
              }))
            }
            className="border border-gray-300 rounded-md p-2"
          />
        ) : (
          user.email
        )}
      </td>
      <td>
        {isEditing ? (
          <PhoneInput
            defaultCountry="HR"
            value={phone}
            onChange={handleChange}
          />
        ) : (
          user.contactNumber
        )}
        {!isValidPhoneNumber && (
          <span className="text-red-500">Invalid phone number format</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <select
            name="user_role"
            value={editedUser.user_role}
            onChange={(e) =>
              setEditedUser((prevUser) => ({
                ...prevUser,
                user_role: e.target.value as UserRole,
              }))
            }
            className="border border-gray-300 rounded-md p-2"
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {convertUserRole(role)}
              </option>
            ))}
          </select>
        ) : (
          convertUserRole(user.user_role)
        )}
      </td>
      <td>
        {isEditing ? (
          <select
            name="user_location_id"
            value={editedUser.user_location_id || ""}
            onChange={(e) =>
              setEditedUser((prevUser) => ({
                ...prevUser,
                user_location_id: parseInt(e.target.value, 10),
              }))
            }
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">No location</option>
            {locations.map((location) => (
              <option
                key={location.location_id}
                value={location.location_id}
              >
                {location.location_name}
              </option>
            ))}
          </select>
        ) : (
          locations.find(
            (location) => location.location_id === user.user_location_id
          )?.location_name || "N/A"
        )}
      </td>
      <td>
        {isEditing ? (
          <div className="flex space-x-2">
            <Button
              className="ml-2"
              onClick={handleSave}
              variant={"constructive"}
              disabled={!isValidPhoneNumber} // Disable save button if phone number is invalid
            >
              Save
            </Button>
            <Button
              className="ml-2"
              onClick={cancelEdit}
              variant={"destructive"}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button className="ml-2" onClick={handleEdit} variant="default">
            Edit
          </Button>
        )}
        {!isEditing && (
          <Button
            variant="destructive"
            className="ml-2"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </td>
    </>
  );
};

export default UserCard;
