import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;
  const title = "KidsPlay — 우리 아이의 작은 놀이터";
  const description = "인터넷 없이도 즐기는 안전한 어린이 교육 게임 10가지";

  return {
    title,
    description,
    manifest: "/manifest.webmanifest",
    applicationName: "KidsPlay",
    appleWebApp: { capable: true, title: "KidsPlay", statusBarStyle: "default" },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
    openGraph: { title, description, type: "website", images: [{ url: imageUrl, width: 1731, height: 909, alt: "KidsPlay 어린이 게임 놀이터" }] },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

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
