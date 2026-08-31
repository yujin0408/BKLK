import type { Metadata } from "next";
import BooksMain from "@/features/books/components/BooksMain";

export const metadata: Metadata = {
  title: "책 둘러보기 | BookLink",
  description: "카테고리별 베스트셀러를 둘러보고 함께 읽을 책을 발견해 보세요.",
};

export default function BooksPage() {
  return <BooksMain />;
}
