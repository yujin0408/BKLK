"use client";

import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Header() {
  const [userInfo, setUserInfo] = useState<{
    email: string;
    nickName?: string;
  } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserInfo(null);
        return;
      }

      setUserInfo({
        email: user.email ?? "",
        nickName: user.user_metadata.nickName,
      });
    };

    getUserInfo();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserInfo({
          email: session.user.email ?? "",
          nickName: session.user.user_metadata.nickName,
        });
      } else {
        setUserInfo(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setIsProfileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed w-full bg-bg-blue py-3 border-b-1 z-50">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        <Link href="/" className="w-[120px]">
          <img src="/BKLK.png" alt="로고" />
        </Link>

        <ul className="flex items-center justify-between gap-5">
          <li className="transition-colors hover:text-sky-500">
            <Link href="/">HOME</Link>
          </li>
          <li className="transition-colors hover:text-sky-500">
            <Link href="/books">BOOK</Link>
          </li>
          <li className="transition-colors hover:text-sky-500">
            <Link href="/meetings">LINK</Link>
          </li>
        </ul>

        {userInfo ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                className="rounded-full object-cover w-[35px] h-[35px]"
                src="/profile.jpg"
                alt="프로필 사진"
              />
              <span>{userInfo.nickName ?? userInfo.email}</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-[-20px] top-11.5 w-36 overflow-hidden rounded-xl border-gray bg-white shadow-sm">
                <Link
                  href="/mypage"
                  onClick={() => setIsProfileOpen(false)}
                  className="text-center block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  마이페이지
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-center block w-full px-4 py-2 text-sm hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">로그인</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
