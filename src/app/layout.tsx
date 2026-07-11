import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/saira-condensed/600.css";
import "@fontsource/saira-condensed/700.css";
import "@fontsource/saira-condensed/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIT WALL — F1 Season Tracker",
  description: "Race calendar, circuits, qualifying, results and standings — powered by OpenF1.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <div className="stripe-divider" />
        <header className="border-b border-line/80 bg-panel/60 backdrop-blur sticky top-0 z-30">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-display font-800 text-2xl tracking-tight text-text">
                PIT<span className="text-red">WALL</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 font-display text-[15px] tracking-wide uppercase">
              <NavLink href="/races">Calendar</NavLink>
              <NavLink href="/standings">Standings</NavLink>
              <NavLink href="/teams">Teams</NavLink>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line/80 mt-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-xs text-text-muted">
            <p>
              Data via{" "}
              <a
                href="https://openf1.org"
                target="_blank"
                rel="noreferrer"
                className="text-text hover:text-red transition-colors"
              >
                OpenF1
              </a>
              .{" "}
              <Link
                href="/privacy"
                className="text-text hover:text-red transition-colors"
              >
                Privacy & Disclaimer
              </Link>
            </p>

            <p>Built for personal use. Made By Kunal Sharma</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-sm text-text-muted hover:text-text transition-colors"
    >
      {children}
    </Link>
  );
}
