import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InterviewAce AI – Master Every Interview With AI",
    template: "%s | InterviewAce AI",
  },
  description:
    "Practice interviews, analyze resumes, identify skill gaps, and accelerate your career growth with Gemini AI.",
  keywords: [
    "AI interview preparation",
    "mock interview",
    "resume analyzer",
    "interview coaching",
    "career development",
    "Gemini AI",
  ],
  authors: [{ name: "InterviewAce AI" }],
  creator: "InterviewAce AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://interviewace.ai",
    title: "InterviewAce AI – Master Every Interview With AI",
    description:
      "Practice interviews, analyze resumes, identify skill gaps, and accelerate your career growth with Gemini AI.",
    siteName: "InterviewAce AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewAce AI",
    description: "Master Every Interview With AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-[#030712] text-[#F8FAFC]`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#0F172A",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#F8FAFC",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
