import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
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

export const metadata: Metadata = {
  title: {
    default: "Jonny Martin — Senior Product Manager",
    template: "%s | Jonny Martin",
  },
  description:
    "Senior Product Manager with 15+ years shipping games and products at Zynga, Jam City, Genies, Mythical Games, and more.",
  metadataBase: new URL("https://jonnymartin.blog"),
  openGraph: {
    title: "Jonny Martin — Senior Product Manager",
    description:
      "Senior Product Manager with 15+ years shipping games and products at Zynga, Jam City, Genies, Mythical Games, and more.",
    url: "https://jonnymartin.blog",
    siteName: "Jonny Martin",
    locale: "en_US",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingCTA />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
