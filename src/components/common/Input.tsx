import { InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const inputVariants = cva(
  `
  h-12 w-full rounded-md border px-4
  text-md text-black-900
  outline-none transition-colors
  placeholder:text-gray-300
  disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300
  `,
  {
    variants: {
      state: {
        default: "border-gray-100 focus:border-active",
        error: "border-error focus:border-error",
        success: "border-success focus:border-success",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">,
    VariantProps<typeof inputVariants> {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  errorMessage?: string;
  successMessage?: string;
}

export default function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  disabled = false,
  className,
  state,
  errorMessage,
  successMessage,
  onClick,
  ...props
}: InputProps) {
  const inputState = errorMessage
    ? "error"
    : successMessage
      ? "success"
      : state;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label className="text-sm font-semibold text-black-900">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}

      <input
        {...props}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputVariants({ state: inputState })}
        onClick={onClick}
      />

      {errorMessage && (
        <p className="text-sm font-medium text-error">ⓘ {errorMessage}</p>
      )}

      {!errorMessage && successMessage && (
        <p className="text-sm font-medium text-success">{successMessage}</p>
      )}
    </div>
  );
}
