import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speak Like a Native | AI English feedback",
  description: "Practice speaking naturally and get instant AI-powered English feedback.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
