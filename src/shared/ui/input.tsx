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
      <div className="relative flex items-center w-full min-w-0 rounded-md focus-within:ring-ring focus-within:ring-offset-0">
        {/* Left Icon for Password */}
        {isPassword && (
          <Lock className="absolute w-5 h-5 pointer-events-none left-3 text-muted-foreground" />
        )}

        {/* Custom Left Icon */}
        {leftIcon && !isPassword && (
          <span className="absolute pointer-events-none left-3 text-muted-foreground">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={inputType}
          className={cn(
            "block w-full min-w-0",
            "h-10 md:h-12",
            "rounded-md border border-input bg-muted",
            "px-3 py-2",
            // iOS Safari: prevent zoom/expanding by ensuring >= 16px font size
            "text-[16px] sm:text-base",
            "leading-5",
            "appearance-none",
            "placeholder:text-muted-foreground placeholder:text-sm sm:placeholder:text-xs",
            "focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Padding adjustments for icons
            (leftIcon || isPassword) && "pl-10",
            (rightIcon || isPassword) && "pr-10",
            className,
          )}
          {...props}
        />

        {/* Right Icon (Password Toggle) */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inline-flex items-center justify-center w-8 h-8 rounded-md right-3 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        ) : (
          rightIcon && (
            <span className="absolute pointer-events-none right-3 text-muted-foreground">
              {rightIcon}
            </span>
          )
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
