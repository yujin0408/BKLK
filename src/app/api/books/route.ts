import type {
  AladinBookItem,
  BookCategorySource,
  CreateBookInput,
} from "@/features/books/types";
import { mapAladinBookItem } from "@/features/books/utils/mapAladinBook";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

interface CreateBookRequest {
  book: CreateBookInput;
}

interface AladinLookupResponse {
  item?: unknown;
  errorCode?: number | string;
  errorMessage?: string;
}

const ALADIN_LOOKUP_URL = "https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx";
const LOOKUP_RATE_LIMIT = 30;
const LOOKUP_RATE_WINDOW_MS = 60_000;
const MAX_TRACKED_CLIENTS = 10_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const lookupRateLimits = new Map<string, RateLimitEntry>();

const TITLE_MAX_LENGTH = 500;
const AUTHOR_MAX_LENGTH = 500;
const ISBN13_MAX_LENGTH = 13;
const DESCRIPTION_MAX_LENGTH = 10_000;
const COVER_URL_MAX_LENGTH = 2_000;
const CATEGORY_NAME_MAX_LENGTH = 500;
const PUBLISHER_MAX_LENGTH = 500;

const BOOK_CATEGORY_SOURCES = [
  "manual",
  "mapped",
  "unclassified",
] as const satisfies readonly BookCategorySource[];

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  try {
    if (!isCreateBookRequest(body)) {
      return NextResponse.json(
        { message: "잘못된 요청입니다." },
        { status: 400 },
      );
    }

    const { book: requestedBook } = body;
    const supabase = createAdminSupabaseClient();

    const { data: existingByItemId, error: itemIdFindError } = await supabase
      .from("books")
      .select("id, title, author, cover_image_url")
      .eq("aladin_item_id", requestedBook.aladinItemId)
      .maybeSingle();

    if (itemIdFindError) {
      console.error("books find error", itemIdFindError);

      return NextResponse.json(
        { message: "도서 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    if (existingByItemId) {
      return NextResponse.json({
        book: existingByItemId,
        created: false,
      });
    }

    const clientIdentifier = getClientIdentifier(request);

    if (!clientIdentifier) {
      return NextResponse.json(
        { message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        {
          status: 429,
          headers: {
            "Retry-After": String(LOOKUP_RATE_WINDOW_MS / 1_000),
          },
        },
      );
    }

    const rateLimit = consumeLookupRateLimit(clientIdentifier);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const book = await getTrustedAladinBook(requestedBook.aladinItemId);

    if (!book) {
      return NextResponse.json(
        { message: "알라딘 도서 정보를 확인하지 못했습니다." },
        { status: 502 },
      );
    }

    const normalizedIsbn13 = normalizeNullableString(book.isbn13);

    if (normalizedIsbn13) {
      const { data: existingByIsbn, error: isbnFindError } = await supabase
        .from("books")
        .select("id, title, author, cover_image_url")
        .eq("isbn13", normalizedIsbn13)
        .maybeSingle();

      if (isbnFindError) {
        console.error("books find error", isbnFindError);

        return NextResponse.json(
          { message: "도서 조회에 실패했습니다." },
          { status: 500 },
        );
      }

      if (existingByIsbn) {
        return NextResponse.json({
          book: existingByIsbn,
          created: false,
        });
      }
    }

    const normalizedPubDate = isNullableDateString(book.pubDate)
      ? normalizeNullableString(book.pubDate)
      : null;

    const { data: created, error: insertError } = await supabase
      .from("books")
      .insert({
        aladin_item_id: book.aladinItemId,
        isbn13: normalizedIsbn13,
        title: book.title.trim(),
        author: book.author.trim(),
        description: normalizeNullableString(book.description),
        cover_image_url: normalizeNullableString(book.coverImageUrl),
        aladin_category_id: book.aladinCategoryId ?? null,
        aladin_category_name: normalizeNullableString(book.aladinCategoryName),
        publisher: normalizeNullableString(book.publisher),
        pub_date: normalizedPubDate,
        category_id: null,
        category_source: "unclassified",
      })
      .select("id, title, author, cover_image_url")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const existingAgainQuery = supabase
          .from("books")
          .select("id, title, author, cover_image_url");
        const { data: existingAgain, error: findAgainError } = normalizedIsbn13
          ? await existingAgainQuery
              .eq("isbn13", normalizedIsbn13)
              .maybeSingle()
          : await existingAgainQuery
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
    isNullableString(book.publisher, PUBLISHER_MAX_LENGTH) &&
    isNullableDateString(book.pubDate) &&
    isNullablePositiveSafeInteger(book.categoryId) &&
    isNullableCategorySource(book.categorySource)
  );
}

function isNullableDateString(
  value: unknown,
): value is string | null | undefined {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  );
}

async function getTrustedAladinBook(itemId: number) {
  const ttbKey = process.env.ALADIN_TTB_KEY;

  if (!ttbKey) {
    console.error("ALADIN_TTB_KEY is not configured");
    return null;
  }

  const url = new URL(ALADIN_LOOKUP_URL);
  url.searchParams.set("TTBKey", ttbKey);
  url.searchParams.set("ItemIdType", "ItemId");
  url.searchParams.set("ItemId", String(itemId));
  url.searchParams.set("Output", "JS");
  url.searchParams.set("Version", "20131101");
  url.searchParams.set("Cover", "Big");

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86_400 },
    });
    const data: unknown = await response.json();

    if (!response.ok || !isAladinLookupResponse(data)) {
      console.error("Aladin lookup error", { status: response.status });
      return null;
    }

    const item = Array.isArray(data.item)
      ? data.item.find(isAladinBookItem)
      : null;

    if (!item) {
      return null;
    }

    const mappedBook = mapAladinBookItem(item);

    return mappedBook.aladinItemId === itemId ? mappedBook : null;
  } catch (error) {
    console.error("Aladin lookup handler error", error);
    return null;
  }
}

function isAladinLookupResponse(value: unknown): value is AladinLookupResponse {
  return isRecord(value) && !("errorCode" in value);
}

function isAladinBookItem(value: unknown): value is AladinBookItem {
  return (
    isRecord(value) &&
    typeof value.itemId === "number" &&
    typeof value.title === "string" &&
    typeof value.author === "string"
  );
}

function getClientIdentifier(request: NextRequest): string | null {
  const vercelForwardedFor = request.headers
    .get("x-vercel-forwarded-for")
    ?.trim();

  if (vercelForwardedFor) {
    return vercelForwardedFor;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedAddress = forwardedFor?.split(",")[0]?.trim();

  return forwardedAddress || null;
}

function consumeLookupRateLimit(clientId: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const current = lookupRateLimits.get(clientId);

  if (!current || current.resetAt <= now) {
    if (current) {
      lookupRateLimits.delete(clientId);
    }

    if (lookupRateLimits.size >= MAX_TRACKED_CLIENTS) {
      const oldestClientId = lookupRateLimits.keys().next().value;

      if (typeof oldestClientId === "string") {
        lookupRateLimits.delete(oldestClientId);
      }
    }

    lookupRateLimits.set(clientId, {
      count: 1,
      resetAt: now + LOOKUP_RATE_WINDOW_MS,
    });

    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= LOOKUP_RATE_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
    };
  }

  current.count += 1;

  return { allowed: true, retryAfterSeconds: 0 };
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
