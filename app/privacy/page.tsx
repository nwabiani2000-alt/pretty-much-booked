import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-16 text-neutral-dark">
      <p className="text-sm text-neutral-secondary">
        <Link href="/" className="text-brand-primary underline">
          Home
        </Link>
      </p>
      <h1 className="font-display text-3xl font-semibold">Privacy Policy</h1>
      <p className="text-sm text-neutral-secondary">Last updated: 22 Nov 2026</p>
      <section className="space-y-3 text-sm leading-relaxed">
        <p>
          Pretty Much Booked (&quot;PMB&quot;) processes personal data to arrange
          mobile beauty bookings in the UK and Nigeria. We act as data controller
          for customer and pro accounts.
        </p>
        <h2 className="text-lg font-semibold">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Name, phone, email</li>
          <li>Booking address (shared only with the assigned pro)</li>
          <li>Payment metadata from Stripe/Paystack (never full card numbers)</li>
          <li>Approximate location for matching (postcode / area)</li>
        </ul>
        <h2 className="text-lg font-semibold">Your rights (UK GDPR)</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Export your data via <code>/api/gdpr/export</code> (signed in)
          </li>
          <li>
            Request deletion via <code>/api/gdpr/delete</code>
          </li>
          <li>Withdraw marketing consent in Profile</li>
        </ul>
        <h2 className="text-lg font-semibold">Retention</h2>
        <p>
          Inactive accounts may be deleted after 2 years. Completed booking street
          addresses are minimized to postcode + city where feasible.
        </p>
        <p>
          Contact:{" "}
          <a className="text-brand-primary underline" href="mailto:privacy@prettymuchbooked.com">
            privacy@prettymuchbooked.com
          </a>
        </p>
      </section>
    </main>
  );
}
