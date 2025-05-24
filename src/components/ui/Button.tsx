import React from "react";
import useAnalytics from "../../hooks/useAnalytics";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "default";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  analyticsEvent?: {
    action: string;
    category: string;
    label: string;
    value?: number;
  };
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  children,
  className = "",
  disabled,
  analyticsEvent,
  onClick,
  ...props
}) => {
  const { trackEvent } = useAnalytics();

  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary: "bg-[#9b9b6f] hover:bg-[#7a7a58] text-white focus:ring-[#9b9b6f]",
    secondary: "bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-700",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    default: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
  };

  const sizeStyles = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  const disabledStyles =
    disabled || isLoading ? "opacity-60 cursor-not-allowed" : "";

  const combinedStyles = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${sizeStyles[size]} 
    ${widthStyles} 
    ${disabledStyles} 
    ${className}
  `;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track analytics event if provided
    if (analyticsEvent) {
      trackEvent(analyticsEvent);
    }

    // Call original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={combinedStyles}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
