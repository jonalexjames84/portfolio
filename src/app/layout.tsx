import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  DM_Serif_Display,
  Plus_Jakarta_Sans,
  Playfair_Display,
} from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StyleThemeProvider } from "@/components/StyleThemeProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FloatingCTA } from "@/components/FloatingCTA";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  variable: "--font-dm-serif",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Jonny Martin | Senior Product Manager",
    template: "%s | Jonny Martin",
  },
  description:
    "Senior Product Manager with 15+ years shipping games and products at Zynga, Jam City, Genies, Mythical Games, and more.",
  metadataBase: new URL("https://portfolio.jonnymartin.blog"),
  openGraph: {
    title: "Jonny Martin | Senior Product Manager",
    description:
      "Senior Product Manager with 15+ years shipping games and products at Zynga, Jam City, Genies, Mythical Games, and more.",
    url: "https://portfolio.jonnymartin.blog",
    siteName: "Jonny Martin",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/jonny-headshot.jpg",
        alt: "Jonny Martin",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Jonny Martin | Senior Product Manager",
    description:
      "Senior Product Manager with 15+ years shipping games and products at Zynga, Jam City, Genies, Mythical Games, and more.",
    images: ["/jonny-headshot.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} ${plusJakartaSans.variable} ${playfairDisplay.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <StyleThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingCTA />
          </div>
          </StyleThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
