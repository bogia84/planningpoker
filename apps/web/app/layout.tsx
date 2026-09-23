import type { Metadata } from "next";
import { Press_Start_2P, VT323, Inter } from "next/font/google";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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

const docsSans = Inter({
  variable: "--font-docs-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const title = "Free Planning Poker Tool for Agile Scrum Teams";
const description =
  "Free online planning poker for agile Scrum teams. Create a room, invite your team, and estimate story points together in real time — no sign-up required.";

// Keep in sync with apps/web/lib/theme.ts (THEME_STORAGE_KEY / DEFAULT_THEME).
// Runs before first paint so the chosen theme applies with no flash.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("pp-theme");if(t!=="pixel"&&t!=="docs"){t="docs";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","docs");}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://tamdoan.work"),
  title: {
    default: title,
    template: `%s | Planning Poker`,
  },
  description,
  keywords: [
    "planning poker",
    "free planning poker",
    "planning poker online",
    "scrum poker",
    "agile estimation tool",
    "story point estimation",
    "sprint planning tool",
    "scrum estimation game",
  ],
  alternates: {
    canonical: BASE_PATH,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    url: BASE_PATH,
    siteName: "Planning Poker",
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
      className={`${pixelHeading.variable} ${pixelBody.variable} ${docsSans.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
