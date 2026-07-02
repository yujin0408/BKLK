type InputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  disabled = false,
  className,
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-black disabled:bg-gray-100`}
      />
    </div>
  );
}
