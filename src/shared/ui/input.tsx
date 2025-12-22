import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock } from "lucide-react";

interface InputProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, isPassword, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <span className="relative flex items-center w-full">
        {/* Left Icon for Password */}
        {isPassword && (
          <Lock className="absolute left-3 h-5 w-5 text-muted-foreground" />
        )}

        {/* Custom Left Icon */}
        {leftIcon && !isPassword && (
          <span className="absolute left-3 text-muted-foreground">
            {leftIcon}
          </span>
        )}

        <input
          type={inputType}
          className={cn(
            "flex h-12 w-full rounded-md border-input bg-muted px-3 py-2 text-base",
            "placeholder:text-muted-foreground placeholder:text-xs",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Padding adjustments for icons
            (leftIcon || isPassword) && "pl-10",
            rightIcon && !isPassword && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />

        {/* Right Icon (Password Toggle) */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-muted-foreground focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        ) : (
          rightIcon && (
            <span className="absolute right-3 text-muted-foreground">
              {rightIcon}
            </span>
          )
        )}
      </span>
    );
  }
);

Input.displayName = "Input";

export { Input };
