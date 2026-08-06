import type { CreateBookInput } from "@/features/books/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface CreateBookRequest {
  book: CreateBookInput;
}

const TITLE_MAX_LENGTH = 500;
const AUTHOR_MAX_LENGTH = 500;
const ISBN13_MAX_LENGTH = 13;
const DESCRIPTION_MAX_LENGTH = 10_000;
const COVER_URL_MAX_LENGTH = 2_000;
const CATEGORY_NAME_MAX_LENGTH = 500;

const BOOK_CATEGORY_SOURCES = ["aladin", "manual", "unclassified"] as const;

type BookCategorySource = (typeof BOOK_CATEGORY_SOURCES)[number];

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isCreateBookRequest(body)) {
      return NextResponse.json(
        { message: "잘못된 도서 정보입니다." },
        { status: 400 },
      );
    }

    const { book } = body;
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { data: existing, error: findError } = await supabase
      .from("books")
      .select("id, title, author, cover_image_url")
      .eq("aladin_item_id", book.aladinItemId)
      .maybeSingle();

    if (findError) {
      console.error("books find error", findError);

      return NextResponse.json(
        { message: "도서 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    if (existing) {
      return NextResponse.json({
        book: existing,
        created: false,
      });
    }

    const { data: created, error: insertError } = await supabase
      .from("books")
      .insert({
        aladin_item_id: book.aladinItemId,
        isbn13: normalizeNullableString(book.isbn13),
        title: book.title.trim(),
        author: book.author.trim(),
        description: normalizeNullableString(book.description),
        cover_image_url: normalizeNullableString(book.coverImageUrl),
        aladin_category_id: book.aladinCategoryId ?? null,
        aladin_category_name: normalizeNullableString(book.aladinCategoryName),
        category_id: book.categoryId ?? null,
        category_source: book.categorySource ?? "unclassified",
      })
      .select("id, title, author, cover_image_url")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: existingAgain, error: findAgainError } = await supabase
          .from("books")
          .select("id, title, author, cover_image_url")
          .eq("aladin_item_id", book.aladinItemId)
          .maybeSingle();

        if (!findAgainError && existingAgain) {
          return NextResponse.json({
            book: existingAgain,
            created: false,
          });
        }
      }

      console.error("books insert error", insertError);

      return NextResponse.json(
        { message: "도서 저장에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        book: created,
        created: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("books handler error", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

function isCreateBookRequest(value: unknown): value is CreateBookRequest {
  if (!isRecord(value) || !("book" in value)) {
    return false;
  }

  const book = value.book;

  if (!isRecord(book)) {
    return false;
  }

  return (
    isPositiveSafeInteger(book.aladinItemId) &&
    isRequiredString(book.title, TITLE_MAX_LENGTH) &&
    isRequiredString(book.author, AUTHOR_MAX_LENGTH) &&
    isNullableString(book.isbn13, ISBN13_MAX_LENGTH) &&
    isNullableString(book.description, DESCRIPTION_MAX_LENGTH) &&
    isNullableHttpUrl(book.coverImageUrl, COVER_URL_MAX_LENGTH) &&
    isNullablePositiveSafeInteger(book.aladinCategoryId) &&
    isNullableString(book.aladinCategoryName, CATEGORY_NAME_MAX_LENGTH) &&
    isNullablePositiveSafeInteger(book.categoryId) &&
    isNullableCategorySource(book.categorySource)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isNullablePositiveSafeInteger(
  value: unknown,
): value is number | null | undefined {
  return value === undefined || value === null || isPositiveSafeInteger(value);
}

function isRequiredString(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function isNullableString(
  value: unknown,
  maxLength: number,
): value is string | null | undefined {
  if (value === undefined || value === null) {
    return true;
  }

  return typeof value === "string" && value.trim().length <= maxLength;
}

function isNullableHttpUrl(
  value: unknown,
  maxLength: number,
): value is string | null | undefined {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value !== "string" || value.length > maxLength) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isNullableCategorySource(
  value: unknown,
): value is BookCategorySource | null | undefined {
  return (
    value === undefined ||
    value === null ||
    BOOK_CATEGORY_SOURCES.some((source) => source === value)
  );
}

function normalizeNullableString(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}
