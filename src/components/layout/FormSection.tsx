interface FormSectionProps {
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function FormSection({
  label,
  description,
  required = false,
  children,
}: FormSectionProps) {
  return (
    <section>
      <label className="mb-3 block text-base font-semibold text-black-900">
        {label}

        {required && (
          <span aria-label="필수 입력" className="ml-1 text-error">
            *
          </span>
        )}
      </label>

      {description && (
        <p className="mb-3 text-sm text-gray-400">{description}</p>
      )}

      {children}
    </section>
  );
}
