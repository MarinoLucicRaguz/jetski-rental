"use client"


import React, { useEffect } from "react";

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-red-500 bg-opacity-75 text-white">
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default ErrorPopup;
