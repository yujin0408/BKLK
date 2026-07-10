"use client";

import DatePicker from "@/components/common/Datepicker";
import Dropdown from "@/components/common/Dropdown";
import MeetingCard from "@/components/common/MeetingCard";
import SearchInput from "@/components/common/SearchInput";
import RegionFilter from "@/components/region/RegionFilter";
import { getMeetings } from "@/features/meetings/api/getMeetings";
import { MeetingCardData } from "@/features/meetings/types";
import { useEffect, useState } from "react";

const options = [
  { label: "전체", value: "all" },
  { label: "모집중", value: "recruiting" },
  { label: "마감임박", value: "admission_closing" },
  { label: "모집마감", value: "closed" },
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<MeetingCardData[]>([]);
  const [keyword, setKeyword] = useState("");
  const [value, setValue] = useState("all");
  const [date, setDate] = useState<Date>();
  const [regionFilter, setRegionFilter] = useState({
    region_1depth_name: "전체",
    region_2depth_name: "전체",
  });
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let ignore = false;

    const fetchMeetings = async () => {
      try {
        const response = await getMeetings({
          keyword: debouncedKeyword || undefined,
          status: value === "all" ? undefined : value,
          date: date ? formatDate(date) : undefined,
          region_1depth_name:
            regionFilter.region_1depth_name === "전체"
              ? undefined
              : regionFilter.region_1depth_name,
          region_2depth_name:
            regionFilter.region_2depth_name === "전체"
              ? undefined
              : regionFilter.region_2depth_name,
        });

        if (!ignore) {
          setMeetings(response);
        }
      } catch (error) {
        if (!ignore) {
          console.error("모임 조회 실패", error);
        }
      }
    };

    fetchMeetings();

    return () => {
      ignore = true;
    };
  }, [debouncedKeyword, value, date, regionFilter]);

  const statusOrder = {
    recruiting: 0,
    admission_closing: 1,
    closed: 2,
  };

  const sortedMeetings = [...meetings].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return new Date(b.meetingAt).getTime() - new Date(a.meetingAt).getTime();
  });

  return (
    <main className="mx-auto w-full max-w-[1280px] px-6 pb-16 pt-10">
      <header>
        <h1 className="text-3xl font-bold text-black-900">Link</h1>
        <p className="mt-2 text-sm text-gray-400">
          관심 있는 지역과 날짜의 모임을 찾아보세요.
        </p>
      </header>

      <section className="mt-8">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="모임을 검색해보세요"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-gray-100 pb-6">
          <Dropdown
            options={options}
            value={value}
            onChange={setValue}
            width="w-[120px]"
          />

          <DatePicker value={date} onChange={setDate} />

          <RegionFilter value={regionFilter} onChange={setRegionFilter} />
        </div>
      </section>

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            총{" "}
            <strong className="font-semibold text-black-900">
              {meetings.length}
            </strong>
            개의 모임
          </p>
        </div>

        {meetings.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
            {sortedMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} data={meeting} />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex min-h-64 items-center justify-center rounded-xl border border-gray-100">
            <p className="text-sm text-gray-400">
              조건에 맞는 모임이 없습니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
