"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  description: string | null;
}

export default function BookDescription({ description }: Props) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const text = textRef.current;

    if (!text || !description) {
      setIsOverflowing(false);
      return;
    }

    const checkOverflow = () => {
      if (!isExpanded) {
        setIsOverflowing(text.scrollHeight > text.clientHeight + 1);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [description, isExpanded]);

  return (
    <section className="mt-14 border-t border-line-200 pt-8">
      <h2 className="text-xl font-bold text-black-800">책 소개</h2>
      {description ? (
        <div className="mt-5 rounded-xl bg-bg-blue px-5 py-6 sm:px-7">
          <p
            ref={textRef}
            className={`whitespace-pre-line text-sm leading-7 text-black-400 ${
              isExpanded ? "" : "line-clamp-5"
            }`}
          >
            {description}
          </p>
          {(isOverflowing || isExpanded) && (
            <button
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="mt-4 text-sm font-semibold text-brand-primary underline underline-offset-4"
            >
              {isExpanded ? "접기" : "더보기"}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-bg-blue px-5 py-10 text-center text-sm text-black-300">
          등록된 책 소개가 없습니다.
        </p>
      )}
    </section>
  );
}
