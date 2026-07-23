import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kidsnara.pages.dev";
const isCloudflarePagesBuild = process.env.CLOUDFLARE_PAGES_BUILD === "1";
const imageUrl = new URL("/og.png", siteUrl).toString();
const title = "KidsPlay — 우리 아이의 작은 놀이터";
const description = "인터넷 없이도 즐기는 안전한 어린이 교육 게임 10가지";

export const metadata: Metadata = {
  metadataBase: isCloudflarePagesBuild ? new URL(siteUrl) : undefined,
  title,
  description,
  manifest: "/manifest.webmanifest",
  applicationName: "KidsPlay",
  appleWebApp: { capable: true, title: "KidsPlay", statusBarStyle: "default" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
  openGraph: { title, description, type: "website", images: [{ url: imageUrl, width: 1731, height: 909, alt: "KidsPlay 어린이 게임 놀이터" }] },
  twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
