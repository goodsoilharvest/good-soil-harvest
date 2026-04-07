import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About Good Soil Harvest — why we write and what we believe.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <span className="text-5xl block mb-4">🌱</span>
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">About Good Soil Harvest</h1>
      </div>

      <div className="prose text-[var(--foreground)]">
        <p>
          The name comes from the Parable of the Sower. Seeds scattered on rocky ground, among thorns,
          on the path — none of them take. But seeds that fall on good soil produce a harvest:
          thirty, sixty, a hundredfold.
        </p>
        <p>
          Good soil is prepared ground. It takes work to get there — clearing out the noise,
          pulling out what doesn't belong, turning things over until something good can grow.
        </p>
        <p>
          That's what this site is about. We write on five topics we believe are worth thinking
          carefully about: <strong>faith</strong>, <strong>finance</strong>, <strong>psychology</strong>,{" "}
          <strong>philosophy</strong>, and <strong>science</strong>. Not because we have all the answers,
          but because we think the questions are worth sitting with.
        </p>
        <p>
          Good Soil Harvest is run by Good Soil Harvest LLC. If you want to reach us, use the{" "}
          <Link href="/contact">contact page</Link>.
        </p>

      </div>
    </div>
  );
}
