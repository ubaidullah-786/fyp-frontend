"use client";

import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LandingHeader } from "@/components/landing-header";
import { LoggedInHeader } from "@/components/logged-in-header";
import { Footer } from "@/components/footer";
import { Suspense, useState, useEffect } from "react";
import { ToastRenderer } from "@/components/ui/toast-renderer";
import { getToken, onTokenChange } from "@/lib/auth";
import { usePathname } from "next/navigation";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isProfilePage = pathname === "/profile";
  const isCodeEditorPage = pathname?.startsWith("/code-editor/");
  const showLandingHeader =
    (!isLoggedIn && (isHomePage || isLoginPage || isSignupPage)) ||
    isProfilePage;

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    const unsub = onTokenChange((t) => {
      setIsLoggedIn(!!t);
    });
    return () => {
      unsub();
    };
  }, []);

  // Don't render anything until we know the login state
  if (isLoggedIn === null) {
    return null;
  }

  return (
    <>
      {/* Show LandingHeader on home, login, signup pages when NOT logged in, and on profile page always */}
      {showLandingHeader ? <LandingHeader /> : null}

      {/* Show LoggedInHeader on all routes when logged in (except profile page and code-editor page) */}
      {isLoggedIn && !isProfilePage && !isCodeEditorPage ? (
        <LoggedInHeader />
      ) : null}

      <main className="flex-1 relative z-10">
        <div className="w-full max-w-[1920px] mx-auto">{children}</div>
      </main>
      {!isCodeEditorPage && <Footer />}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Preload critical font */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body
        className="font-sans antialiased flex flex-col min-h-screen overflow-x-hidden bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]"
        style={{ minHeight: "100vh", height: "100%" }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* ToastRenderer must be mounted high so toast() calls from Login/Header work */}
          <ToastRenderer />

          <Suspense fallback={null}>
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
