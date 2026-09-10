import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { BASE_PATH } from "@/lib/basePath";
import "./globals.css";

const pixelHeading = Press_Start_2P({
  variable: "--font-pixel-heading",
  weight: "400",
  subsets: ["latin"],
});

const pixelBody = VT323({
  variable: "--font-pixel-body",
  weight: "400",
  subsets: ["latin"],
});

const title = "Planning Poker";
const description = "A fun, 8-bit styled planning poker tool for Scrum teams";

export const metadata: Metadata = {
  metadataBase: new URL("https://tamdoan.work"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: BASE_PATH,
    siteName: title,
    images: [{ url: `${BASE_PATH}/og-image.png`, width: 1200, height: 630, alt: title }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${BASE_PATH}/og-image.png`],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pixelHeading.variable} ${pixelBody.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
