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

const title = "Planning Poker";
const description = "A planning poker tool for Scrum teams";

// Keep in sync with apps/web/lib/theme.ts (THEME_STORAGE_KEY / DEFAULT_THEME).
// Runs before first paint so the chosen theme applies with no flash.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("pp-theme");if(t!=="pixel"&&t!=="docs"){t="docs";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","docs");}})();`;

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
