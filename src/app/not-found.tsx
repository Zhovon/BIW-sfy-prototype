import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { display, bodyFont } from "@/lib/fonts";

export const metadata = { title: "Page not found · BIW" };

// Root not-found catches unmatched URLs. Route groups each own their <html>, so
// this is self-contained (branded) rather than the bare Next default.
export default function NotFound() {
  return (
    <html lang="en" className={`${display.variable} ${bodyFont.variable}`}>
      <body>
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-paper">
          <Image src="/biw-logo.png" alt="BIW" width={72} height={72} className="h-16 w-auto object-contain mb-8" />
          <p className="kicker mb-3">Error 404</p>
          <h1 className="font-display text-4xl md:text-5xl">This page could not be found.</h1>
          <p className="mt-5 text-muted max-w-[42ch] leading-relaxed">
            The page you&rsquo;re looking for may have moved or no longer exists.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="btn btn--gold">Back to home</Link>
            <Link href="/collections/all" className="btn btn--ghost">Browse all products</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
