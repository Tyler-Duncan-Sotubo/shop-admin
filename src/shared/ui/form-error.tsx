import React from "react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <p className={cn("mx-1 text-sm font-semibold text-red-600", className)}>
      {message}
    </p>
  );
};

export default FormError;
