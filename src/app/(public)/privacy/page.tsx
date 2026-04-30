import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Good Soil Harvest",
  description: "How Good Soil Harvest collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-serif text-4xl font-bold text-[var(--foreground)] mb-2 text-center">Privacy Policy</h1>
      <p className="text-sm text-[var(--text-muted)] mb-10 text-center">Last updated: April 11, 2026</p>

      <div className="prose text-[var(--foreground)]">

        <p>
          Good Soil Harvest LLC (&ldquo;Good Soil Harvest,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates
          goodsoilharvest.com (the &ldquo;Site&rdquo;). This Privacy Policy explains what personal information
          we collect, how we use it, and your rights. By using the Site, you agree to the
          practices described below.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>Information You Provide Directly</h3>
        <ul>
          <li><strong>Email address</strong> — required to create an account. Used for authentication, transactional emails, and account communications.</li>
          <li><strong>Password</strong> — stored as a one-way cryptographic hash. We cannot read or recover your password.</li>
          <li><strong>Contact form messages</strong> — if you write to us, we receive your name, email, and message.</li>
        </ul>

        <h3>Information We Collect Automatically</h3>
        <ul>
          <li><strong>Reading history</strong> — which articles you read and when, used to power your personalized &ldquo;For You&rdquo; feed.</li>
          <li><strong>Saved articles</strong> — articles you bookmark with the like button.</li>
          <li><strong>Content preferences</strong> — the topics you engage with most, derived from your reading and saving activity and used by our recommendation algorithm.</li>
          <li><strong>Session cookie</strong> — a secure, encrypted cookie that keeps you logged in. It does not track you across other websites.</li>
          <li><strong>Basic technical data</strong> — IP address, browser type, and referring URL, collected by our hosting provider (Cloudflare) for security and performance purposes only.</li>
          <li><strong>Aggregate page analytics</strong> — anonymous page-view counts and referrer data via Cloudflare Web Analytics. No tracking cookies, no cross-site tracking, no fingerprinting.</li>
          <li><strong>Advertising data</strong> — on free articles, Google AdSense may set cookies and collect data to serve and measure ads. Premium and Deep Roots subscribers see no ads. See &ldquo;Third-Party Service Providers&rdquo; below for details.</li>
        </ul>

        <h3>Payment Information</h3>
        <p>
          All payment processing is handled by <strong>Stripe, Inc.</strong> We do not store your credit card
          number, CVV, or full billing address. We store only the data Stripe returns to us: your
          subscription plan, status, renewal date, and Stripe customer ID. See{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>.
        </p>

        <h3>AI Search Queries (Deep Roots Members)</h3>
        <p>
          If you use the AI-powered search feature, your search query is sent to{" "}
          <strong>Anthropic, PBC</strong> for processing by the Claude AI model. We do not
          store your search queries in our database. See{" "}
          <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">anthropic.com/privacy</a>.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To create and maintain your account</li>
          <li>To authenticate you and keep your session secure</li>
          <li>To process subscription payments and manage your membership</li>
          <li>To send transactional emails (verification, subscription receipts, billing alerts)</li>
          <li>To power your personalized &ldquo;For You&rdquo; feed using our recommendation algorithm</li>
          <li>To enforce subscription-based access to premium content</li>
          <li>To respond to contact form messages</li>
          <li>To monitor for and respond to security threats or abuse</li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal information. We do not use your data for
          third-party advertising or share it with data brokers.
        </p>

        <h2>3. Our Recommendation Algorithm</h2>
        <p>
          The &ldquo;For You&rdquo; tab is powered by a personalization algorithm that tracks which topics
          (faith, finance, psychology, philosophy, science) you read and save, then weights
          suggestions toward the subjects you engage with most. This processing uses only your
          own activity on this Site — no external profiling or behavioral advertising data is
          involved.
        </p>

        <h2>4. Cookies and Local Storage</h2>
        <p>
          We use one strictly necessary authentication cookie to maintain your login session.
          This cookie does not track you across other websites and is deleted when you sign out.
        </p>
        <p>
          We also use your browser&rsquo;s <code>localStorage</code> to save preferences that never leave
          your device (such as whether you have dismissed onboarding prompts). This data is not
          transmitted to our servers.
        </p>
        <p>
          On free articles, Google AdSense may set advertising cookies. Premium and Deep Roots
          subscribers do not see ads and are not subjected to advertising cookies on this Site.
          We do not use tracking pixels or analytics scripts beyond the privacy-respecting
          Cloudflare Web Analytics described above.
        </p>

        <h2>5. Third-Party Service Providers</h2>
        <ul>
          <li><strong>Cloudflare</strong> — website hosting (Workers), database (D1), and Web Analytics. May log IP addresses and request metadata for performance, security, and aggregate analytics.</li>
          <li><strong>Stripe</strong> — payment processing under PCI-DSS compliance.</li>
          <li><strong>Resend</strong> — transactional email delivery. Your email address is transmitted to Resend to deliver verification and account emails.</li>
          <li><strong>Anthropic</strong> — AI language model processing for the Deep Roots AI search feature.</li>
          <li><strong>Google AdSense</strong> — serves contextual advertising on free articles. AdSense may use cookies and collect data per <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google&rsquo;s advertising policy</a>.</li>
        </ul>

        <h2>6. AI-Generated Content</h2>
        <p>
          Some or all of the editorial articles published on Good Soil Harvest are written or
          significantly assisted by artificial intelligence. All AI-generated content is reviewed
          by a human editor before publication. We are transparent about AI involvement in our
          publishing process.
        </p>

        <h2>7. Data Retention and Account Deletion</h2>
        <p>
          We retain your account information for as long as your account exists. You can
          permanently delete your account at any time from your account settings. When you
          delete your account:
        </p>
        <ul>
          <li>
            Your user record, reading history, saved articles, likes, and content preferences
            are permanently deleted from our database immediately.
          </li>
          <li>
            Your active subscription is canceled immediately in Stripe, and your Stripe
            customer record is also deleted. If you have paid for a period that is not yet
            fully used, a prorated refund is issued automatically to your card for the
            unused portion. See our <Link href="/terms">Terms of Service</Link> for full
            details on the refund policy.
          </li>
          <li>
            Your email address is retained in a limited fraud-prevention log (not used for
            marketing or any other purpose) so that the same email address cannot claim
            another free trial in the future. This is the only personal data retained after
            account deletion. You may request removal of this entry by contacting us.
          </li>
          <li>
            Billing records (invoice history) may be retained by Stripe and by us for up to
            7 years where required by tax, accounting, or legal compliance obligations. These
            records contain transaction-level data only, not account credentials.
          </li>
        </ul>

        <h2>8. Children&rsquo;s Privacy</h2>
        <p>
          This Site is not directed to children under 13. We do not knowingly collect personal
          information from children under 13. If you believe a child has provided us personal
          information, please contact us and we will delete it promptly.
        </p>

        <h2>9. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
          <li><strong>Correction</strong> — ask us to correct inaccurate information</li>
          <li><strong>Deletion</strong> — request that we delete your account and personal data</li>
          <li><strong>Opt out</strong> — withdraw consent for optional processing (note: some processing is required to provide the service)</li>
        </ul>
        <p>
          To exercise these rights, <Link href="/contact">contact us</Link>. We will respond within 30 days.
        </p>

        <h2>10. Security</h2>
        <p>
          We implement reasonable technical and organizational measures to protect your data —
          including password hashing, encrypted database connections, HTTPS, and access controls.
          No system is perfectly secure. If you believe your account has been compromised,
          contact us immediately.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. The &ldquo;Last updated&rdquo; date at the top
          reflects the most recent revision. Material changes will be announced via a notice on
          the Site or by email. Continued use of the Site after changes are posted constitutes
          acceptance of the revised policy.
        </p>

        <h2>12. Contact</h2>
        <p>
          For privacy questions or to exercise your data rights, use our{" "}
          <Link href="/contact">contact form</Link> or email{" "}
          <a href="mailto:goodsoilharvest@proton.me">goodsoilharvest@proton.me</a>.
        </p>
        <p>Good Soil Harvest LLC — goodsoilharvest.com</p>

      </div>
    </div>
  );
}
