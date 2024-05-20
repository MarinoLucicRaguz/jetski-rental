"use client";

import React from "react";

interface AwaitPermissionProps {
  message: string;
}

const AwaitPermission: React.FC<AwaitPermissionProps> = ({ message }) => {
  return (
    <div className="text-lg mb-4">{message}</div>
  );
};

export default AwaitPermission;
