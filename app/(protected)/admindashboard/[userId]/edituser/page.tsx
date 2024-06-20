"use client"
import { EditUserPage } from "@/components/admin/edit-user";
import { useParams } from "next/navigation";

const EditUser = () => {
  const { userId } = useParams(); 

  if (Array.isArray(userId)) {
    return <div>Error: Invalid user ID</div>;
  }

  return userId ? <EditUserPage userId={userId} /> : <div>Loading...</div>;
};

export default EditUser;
