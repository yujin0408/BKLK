import { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  `
  inline-flex items-center justify-center gap-2
  rounded-md
  font-semibold
  transition-colors
  cursor-pointer
  disabled:cursor-not-allowed
  `,
  {
    variants: {
      variant: {
        solid: `
          bg-blue-500 text-white
          hover:bg-active
          active:bg-disabled
          disabled:bg-gray-100 disabled:text-gray-300
        `,
        outline: `
          border border-blue-500 bg-white text-blue-500
          hover:border-active hover:text-active
          active:border-disabled active:text-disabled
          disabled:border-gray-100 disabled:text-gray-300
        `,
        icon: `
          bg-blue-500 text-white
          hover:bg-active
          active:bg-disabled
          disabled:bg-gray-100 disabled:text-white
        `,
      },

      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },

      fullWidth: {
        true: "w-full",
        false: "",
      },
    },

    defaultVariants: {
      variant: "solid",
      size: "lg",
      fullWidth: false,
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant,
  size,
  fullWidth,
  leftIcon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    >
      {leftIcon}
      {children}
    </button>
  );
}
