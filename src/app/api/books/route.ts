import type { CreateBookInput } from "@/features/books/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface CreateBookRequest {
  book: CreateBookInput;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isCreateBookRequest(body)) {
      return NextResponse.json(
        { message: "잘못된 요청입니다." },
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
        isbn13: book.isbn13,
        title: book.title,
        author: book.author,
        description: book.description,
        cover_image_url: book.coverImageUrl,
        aladin_category_id: book.aladinCategoryId,
        aladin_category_name: book.aladinCategoryName,
        category_id: null,
        category_source: "unclassified",
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
  if (typeof value !== "object" || value === null || !("book" in value)) {
    return false;
  }

  const { book } = value;

  if (typeof book !== "object" || book === null) {
    return false;
  }

  return (
    "aladinItemId" in book &&
    typeof book.aladinItemId === "number" &&
    Number.isSafeInteger(book.aladinItemId) &&
    book.aladinItemId > 0 &&
    "title" in book &&
    typeof book.title === "string" &&
    book.title.trim().length > 0 &&
    "author" in book &&
    typeof book.author === "string" &&
    book.author.trim().length > 0
  );
}
