import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        h-12
        rounded-md
        bg-black
        px-4
        text-white
        font-semibold
        transition-opacity
        hover:opacity-80
        disabled:cursor-not-allowed
        disabled:bg-gray-300
        corsur-pointer
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
