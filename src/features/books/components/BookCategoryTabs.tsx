import type { BookCategory } from "@/features/books/types";

interface Props {
  categories: BookCategory[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}

const ALL_CATEGORY: BookCategory = {
  id: 0,
  slug: "bestseller",
  name: "베스트셀러",
};

export default function BookCategoryTabs({
  categories,
  selectedSlug,
  onSelect,
}: Props) {
  return (
    <div
      role="tablist"
      aria-label="도서 카테고리"
      className="flex flex-wrap gap-2.5"
    >
      {[ALL_CATEGORY, ...categories].map((category) => {
        const selected = selectedSlug === category.slug;

        return (
          <button
            key={category.slug}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(category.slug)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              selected
                ? "border-brand-primary bg-brand-primary text-white"
                : "border-line-200 bg-white text-black-500 hover:border-brand-primary hover:bg-bg-blue hover:text-brand-primary"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
