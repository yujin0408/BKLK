"use client";

import useOutsideClick from "@/hooks/useOutsideClick";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import Input from "./Input";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}

function DatePicker({ value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(datePickerRef, () => {
    setIsOpen(false);
  });

  const inputValue = value
    ? `${value.getFullYear()}.${String(value.getMonth() + 1).padStart(2, "0")}.${String(
        value.getDate(),
      ).padStart(2, "0")}`
    : "";

  return (
    <div ref={datePickerRef} className="relative inline-block">
      <div className="relative">
        <Input
          value={inputValue}
          readOnly
          onClick={() => setIsOpen(true)}
          placeholder="YYYY.MM.DD"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsOpen(true);
            }
          }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          inputClassName="cursor-pointer"
        />

        <CalendarDays
          size={20}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(selectedDate) => {
              onChange(selectedDate);
              setIsOpen(false);
            }}
            locale={ko}
            showOutsideDays
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft size={22} />
                ) : (
                  <ChevronRight size={22} />
                ),
            }}
            formatters={{
              formatCaption: (month) =>
                `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
            }}
            classNames={{
              root: "w-[250px] bg-white",
              months: "w-full",
              month: "relative w-full",
              month_caption:
                "relative mb-6 flex h-8 items-center justify-center text-base font-semibold text-gray-800",
              caption_label: "text-base font-semibold",
              nav: "absolute left-6 right-6 top-5 z-10 flex items-center justify-between",
              button_previous:
                "flex size-8 items-center justify-center rounded-md hover:bg-default",
              button_next:
                "flex size-8 items-center justify-center rounded-md hover:bg-default",
              weekdays: "mb-3 grid grid-cols-7 text-center",
              weekday: "text-sm font-medium text-gray-700",
              week: "grid grid-cols-7",
              day: "flex size-11 items-center justify-center text-sm font-medium",
              day_button:
                "flex size-9 items-center justify-center rounded-md text-gray-800 hover:bg-default",
              selected:
                "[&>button]:bg-active [&>button]:text-white [&>button]:hover:bg-active",
              today:
                "[&>button]:border [&>button]:border-line-200 [&>button]:font-semibold",
              outside: "[&>button]:text-gray-400",
              disabled: "[&>button]:text-gray-300",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default DatePicker;
