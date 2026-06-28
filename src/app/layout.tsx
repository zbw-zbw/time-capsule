import type { Metadata } from "next";
import { Long_Cang, Noto_Serif_SC, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ScrollObserver } from "@/components/ScrollObserver";

const longCang = Long_Cang({
  weight: "400",
  variable: "--font-long-cang",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "700"],
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "时间胶囊 — 给未来的自己写一封信",
  description:
    "AI驱动的情感化时间胶囊。给未来的自己写一封信，让AI帮「未来的你」先回一封。把此刻的愿望和心情封存，等待未来打开的那一天。",
  keywords: ["时间胶囊", "AI", "给未来的自己写信", "时间信件"],
  authors: [{ name: "Kyrie Wen" }],
  openGraph: {
    title: "时间胶囊 — 给未来的自己写一封信",
    description: "AI帮「未来的你」提前回信——你不用等一年，就能听到未来的自己想对你说什么。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${longCang.variable} ${notoSerifSC.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen font-sans">
        <Navbar />
        <ScrollObserver />
        <main className="relative z-[1]">{children}</main>
      </body>
    </html>
  );
}
