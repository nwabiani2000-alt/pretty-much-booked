import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-16 text-neutral-dark">
      <p className="text-sm text-neutral-secondary">
        <Link href="/" className="text-brand-primary underline">
          Home
        </Link>
      </p>
      <h1 className="font-display text-3xl font-semibold">Terms of Service</h1>
      <p className="text-sm text-neutral-secondary">Last updated: 22 Nov 2026</p>
      <section className="space-y-3 text-sm leading-relaxed">
        <p>
          By using Pretty Much Booked you agree to these terms for booking mobile
          beauty services.
        </p>
        <h2 className="text-lg font-semibold">Bookings & deposits</h2>
        <p>
          A 30% deposit is taken at checkout. Remaining balance is due to the pro
          on completion. Emergency bookings (within 2 hours) include a fee.
        </p>
        <h2 className="text-lg font-semibold">Cancellations</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>&gt;24h before: full deposit refund</li>
          <li>2–24h: 50% refund</li>
          <li>&lt;2h: no refund</li>
          <li>Pro cancels: full refund + £10 credit</li>
        </ul>
        <h2 className="text-lg font-semibold">Conduct</h2>
        <p>
          Abusive behaviour may result in account suspension. Pros and customers
          can report issues from the booking screen.
        </p>
      </section>
    </main>
  );
}
