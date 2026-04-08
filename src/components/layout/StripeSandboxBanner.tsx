export function StripeSandboxBanner() {
  return (
    <div className="bg-red-700 text-white text-xs sm:text-sm px-4 py-2.5 flex items-center justify-center text-center leading-snug">
      <span>
        <strong className="font-semibold">⚠ Stripe is in sandbox mode — no real charges will occur.</strong>
        {" "}Once live, all subscribers will be automatically downgraded to Free tier. No accounts will be disabled — subscribers will need to re-upgrade to their desired plan via Account Settings.
      </span>
    </div>
  );
}
