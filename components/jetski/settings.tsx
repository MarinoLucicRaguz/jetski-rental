"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateUserDetails } from "@/actions/updateUser";
import { CardWrapper } from "../auth/card-wrapper";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Input, TextField } from "@mui/material";

const SettingsPage = () => {
  const user = useCurrentUser();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!user?.email) {
        throw new Error("User email not found");
      }

      const response = await updateUserDetails({ 
        email: user.email, 
        name, 
        currentPassword, 
        newPassword 
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setSuccess("Details updated successfully.");
      router.refresh();
    } catch (err) {
      setError("Failed to update details.");
    }
  };

  return (
    <CardWrapper headerLabel="Settings" backButtonLabel="Go back to dashboard" backButtonHref="/dashboard">
        <div>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            </div>
            <div className="mb-4">
                <TextField
                label="Current password"
                variant="outlined"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                required
                />
            </div>
            <div className="mb-4">
                <TextField
                label="New password"
                variant="outlined"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                />
            </div>
            <Button type="submit">
            Save Changes
            </Button>
        </form>
        <FormError message={error} />
        <FormSuccess message={success} />
    </div>
    </CardWrapper>
  );
};

export default SettingsPage;
