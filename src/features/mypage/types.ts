export type LibraryStatus = "reading" | "wish" | "finished";

export interface MyPageProfile {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  description: string | null;
}

export interface LibraryRecentBook {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
}

export interface LibrarySummaryItem {
  status: LibraryStatus;
  label: string;
  count: number;
  recentBook: LibraryRecentBook | null;
}

export interface MyPageData {
  profile: MyPageProfile;
  meetingCounts: {
    applied: number;
    hosted: number;
  };
  library: LibrarySummaryItem[];
}
