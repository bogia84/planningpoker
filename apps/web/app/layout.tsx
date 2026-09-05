import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Planning Poker",
  description: "A fun, 8-bit styled planning poker tool for Scrum teams",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pixelHeading.variable} ${pixelBody.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
