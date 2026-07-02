// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getMeetings } from "@/features/meetings/api/getMeetings";

export default function Home() {
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    getMeetings().then(setMeetings).catch(console.error);
  }, []);

  return (
    <main>
      <h1>BookLink</h1>

      <pre>{JSON.stringify(meetings, null, 2)}</pre>
    </main>
  );
}
