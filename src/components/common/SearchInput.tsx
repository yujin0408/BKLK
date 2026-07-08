import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function SearchInput({
  value,
  onChange,
  placeholder = "검색어를 입력하세요",
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-lg border border-line-100 px-10 text-sm outline-none placeholder:text-gray-400 focus:border-brand-primary"
      />
    </div>
  );
}

export default SearchInput;
