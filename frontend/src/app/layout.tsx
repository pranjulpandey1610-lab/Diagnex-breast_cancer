import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diagnex | Breast health support",
  description: "Clearer breast-health information. Safer next steps.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col font-sora overflow-x-hidden w-full">{children}</body>
    </html>
  );
}
