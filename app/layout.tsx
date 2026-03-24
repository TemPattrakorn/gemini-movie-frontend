import type { Metadata } from "next";
import { Averia_Serif_Libre } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const averia = Averia_Serif_Libre({
  variable: "--font-averia",
  subsets: ["latin"],
  weight: ["300", "400", "700"], 
});

export const metadata: Metadata = {
  title: "Gemini Movie Recommender",
  description: "Powered by Gemini 2.5 Flash & FastAPI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${averia.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}