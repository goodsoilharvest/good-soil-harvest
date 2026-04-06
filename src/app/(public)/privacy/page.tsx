import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-serif text-4xl font-bold text-[var(--foreground)] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">Last updated: April 2026</p>
      <div className="prose text-[var(--foreground)]">
        <p>
          Good Soil Harvest LLC ("we", "us", or "our") operates goodsoilharvest.com.
          This page explains what information we collect and how we use it.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly — such as your email address if you
          subscribe to our newsletter or create an account. We also collect standard web
          analytics data (pages visited, time on site, browser type) through our hosting
          provider. We do not sell your personal information.
        </p>
        <h2>Cookies</h2>
        <p>
          We use cookies to keep you logged in if you have an account. We do not use
          third-party advertising cookies.
        </p>
        <h2>Third-Party Services</h2>
        <p>
          We use Vercel for hosting and Neon for our database. These services have their
          own privacy policies. If you make a purchase through an affiliate link, the
          retailer's privacy policy applies to that transaction.
        </p>
        <h2>Your Rights</h2>
        <p>
          You may request deletion of your account and associated data at any time by
          contacting us through the <a href="/contact">contact page</a>.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about this policy? Reach us through our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}
