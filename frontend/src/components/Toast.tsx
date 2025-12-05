// src/components/Toast.tsx
import React from "react";
import { cn } from "../lib/utils"; // optional, from shadcn template, or use simple string concatenation

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
};

export const Toast: React.FC<ToastProps> = ({ message, type = "info" }) => {
  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

  return (
    <div
      className={cn(
        "text-white px-4 py-2 rounded shadow-md animate-slide-in-right",
        bgColor
      )}
    >
      {message}
    </div>
  );
};
