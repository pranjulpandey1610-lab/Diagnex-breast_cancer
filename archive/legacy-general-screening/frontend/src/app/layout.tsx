import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagnex — Secure Medical Screening Platform",
  description:
    "Diagnex is a secure, AI-powered medical screening platform for diabetes and breast cancer risk assessment. Research-only screening estimates with clinician review workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
