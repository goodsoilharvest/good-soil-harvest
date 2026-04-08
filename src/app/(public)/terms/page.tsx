import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Good Soil Harvest",
  description: "The terms and conditions governing use of Good Soil Harvest and its subscription plans.",
};

export default function TermsPage() {
  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-serif text-4xl font-bold text-[var(--foreground)] mb-2">Terms of Service</h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">Last updated: April 8, 2026</p>

      <div className="prose text-[var(--foreground)]">

        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of
          goodsoilharvest.com (the &ldquo;Site&rdquo;) operated by Good Soil Harvest LLC (&ldquo;Good Soil Harvest,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using the Site, you agree to be bound
          by these Terms. If you do not agree, do not use the Site.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 13 years old to use this Site. By creating an account, you
          represent that you are at least 13 and that the information you provide is accurate.
          If you are under 18, you represent that you have your parent or guardian&rsquo;s permission.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activity that occurs under your account. You agree to notify us immediately
          of any unauthorized use of your account. We are not liable for losses caused by
          unauthorized use of your account.
        </p>
        <p>
          You may not share your account credentials or allow others to access premium content
          through your subscription. Each subscription is for a single individual.
        </p>

        <h2>3. Subscriptions and Billing</h2>

        <h3>Plans</h3>
        <p>
          We offer paid membership plans (currently Seedling and Deep Roots) with the features
          described on our <Link href="/pricing">pricing page</Link>. Features and pricing are
          subject to change with notice.
        </p>

        <h3>Free Trial</h3>
        <p>
          New subscribers may receive a 7-day free trial on qualifying plans. Your payment
          method will be charged automatically at the end of the trial period unless you cancel
          before the trial ends. Only one free trial per person.
        </p>

        <h3>Recurring Billing</h3>
        <p>
          Paid subscriptions are billed on a recurring monthly basis. By subscribing, you
          authorize Good Soil Harvest to charge your payment method on file through Stripe
          on each billing cycle until you cancel.
        </p>

        <h3>Cancellation</h3>
        <p>
          You may cancel your subscription at any time through your account settings (&ldquo;Manage
          billing&rdquo;). Cancellation takes effect at the end of your current billing period — you
          retain access to premium content through that date. We do not issue prorated refunds
          for partial months, except where required by applicable law.
        </p>

        <h3>Plan Changes</h3>
        <p>
          You may upgrade or downgrade your plan at any time. Upgrades take effect immediately
          with proration applied to your next invoice. Downgrades take effect at the end of
          your current billing period.
        </p>

        <h3>Payment Failures</h3>
        <p>
          If your payment method fails, access to premium content may be suspended until the
          balance is resolved. We will notify you by email. You can update your payment method
          through the billing portal in your account settings.
        </p>

        <h2>4. Content and Intellectual Property</h2>

        <h3>Our Content</h3>
        <p>
          All articles, graphics, branding, and other content published on the Site are owned
          by Good Soil Harvest LLC or licensed to us. You may read and personally use this
          content for non-commercial purposes. You may not copy, reproduce, republish, scrape,
          sell, or redistribute our content without written permission.
        </p>

        <h3>AI-Generated Content</h3>
        <p>
          Some or all editorial articles on this Site are written or substantially assisted
          by artificial intelligence and reviewed by a human editor before publication. We
          disclose AI involvement as part of our editorial transparency commitment.
        </p>

        <h3>User Content</h3>
        <p>
          Currently, users do not submit public content to this Site. If we introduce features
          that allow user submissions (such as comments), additional terms will apply.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Site in any way that violates applicable law or regulation</li>
          <li>Attempt to gain unauthorized access to any part of the Site or its systems</li>
          <li>Scrape, crawl, or systematically download content from the Site</li>
          <li>Share, redistribute, or resell premium content from your subscription</li>
          <li>Create multiple accounts to circumvent subscription requirements or free trial limits</li>
          <li>Interfere with or disrupt the Site&rsquo;s infrastructure or other users&rsquo; access</li>
          <li>Use automated tools to interact with the Site without our written permission</li>
        </ul>

        <h2>6. Disclaimers</h2>
        <p>
          THE SITE AND ALL CONTENT ARE PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, OR NON-INFRINGEMENT. We do not warrant that the Site will be uninterrupted,
          error-free, or free of harmful components.
        </p>
        <p>
          Content on this Site is for informational and educational purposes only. Nothing
          constitutes professional financial, legal, medical, or psychological advice. See our
          full <Link href="/disclaimer">Disclaimer</Link>.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, GOOD SOIL HARVEST LLC AND ITS MEMBERS,
          OFFICERS, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF
          ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY
          CLAIM ARISING OUT OF THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE
          12 MONTHS PRECEDING THE CLAIM.
        </p>

        <h2>8. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Good Soil Harvest LLC from any
          claims, damages, costs, and expenses (including reasonable attorney fees) arising
          from your violation of these Terms or your use of the Site.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may suspend or terminate your account at any time for violation of these Terms,
          with or without notice. Upon termination, your access to premium content will end.
          If we terminate your account without cause, we will issue a prorated refund for
          any unused subscription period.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the State of Indiana, without regard to
          conflict of law principles. Any dispute arising under these Terms shall be resolved
          exclusively in the state or federal courts located in Indiana.
        </p>

        <h2>11. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date reflects the
          most recent revision. Material changes will be communicated via a notice on the
          Site or by email. Your continued use of the Site after changes are posted constitutes
          acceptance of the revised Terms.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions about these Terms? Use our <Link href="/contact">contact form</Link> or
          email <a href="mailto:goodsoilharvest@proton.me">goodsoilharvest@proton.me</a>.
        </p>
        <p>Good Soil Harvest LLC — goodsoilharvest.com</p>

      </div>
    </div>
  );
}
