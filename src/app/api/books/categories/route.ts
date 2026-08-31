import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ALADIN_CATEGORY_IDS } from "@/features/books/constants";

interface CategoryRow {
  id: number;
  slug: string;
  name: string;
  order: number;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("id");

    if (error) {
      console.error("book_categories query error", error);
      return NextResponse.json(
        { message: "카테고리 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    const rows: unknown = data;
    const categories = Array.isArray(rows)
      ? rows
          .map(toCategoryRow)
          .filter((row): row is CategoryRow => row !== null)
          .filter((row) => row.slug in ALADIN_CATEGORY_IDS)
          .sort((a, b) => a.order - b.order)
          .map(({ id, slug, name }) => ({ id, slug, name }))
      : [];

    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("book_categories handler error", error);
    return NextResponse.json(
      { message: "카테고리 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

function toCategoryRow(value: unknown, index: number): CategoryRow | null {
  if (typeof value !== "object" || value === null) return null;

  const row = value as Record<string, unknown>;
  const id = row.id;
  const slug = row.slug ?? row.code;
  const name = row.name ?? row.label ?? row.display_name;
  const order = row.display_order ?? row.sort_order ?? index;

  if (
    typeof id !== "number" ||
    typeof slug !== "string" ||
    typeof name !== "string"
  ) {
    return null;
  }

  return {
    id,
    slug,
    name,
    order: typeof order === "number" ? order : index,
  };
}
