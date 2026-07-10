"use client";

import useOutsideClick from "@/hooks/useOutsideClick";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  width?: string;
}

function Dropdown({
  value,
  options,
  onChange,
  placeholder = "선택하세요",
  disabled,
  className,
  width = "w-full",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef, () => {
    setIsOpen(false);
  });

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${width}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm ${
          disabled ? "cursor-not-allowed bg-gray-100 text-gray-400" : "bg-white"
        } ${isOpen ? "border-active" : "border-gray-100"} ${className || ""}`}
      >
        <span className={selectedOption ? "text-black" : "text-gray-400"}>
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <ul className="absolute top-full z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
