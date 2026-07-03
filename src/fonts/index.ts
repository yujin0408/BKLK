import localFont from "next/font/local";

export const pretendard = localFont({
  src: [
    {
      path: "./Pretendard-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Pretendard-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Pretendard-Bold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./Pretendard-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
});
