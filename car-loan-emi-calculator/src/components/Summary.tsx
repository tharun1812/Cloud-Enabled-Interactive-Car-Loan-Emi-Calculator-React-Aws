import type { LoanResult } from '../lib/emi';
import { formatInr, formatInrExact } from '../lib/format';

export default function Summary({ result }: { result: LoanResult }) {
  const interestShare = result.totalPayment > 0 ? (result.totalInterest / result.totalPayment) * 100 : 0;

  return (
    <section aria-labelledby="summary-heading" className="rounded-2xl bg-ink p-6 text-white">
      <h2 id="summary-heading" className="text-sm font-semibold text-slate-300">
        Your monthly EMI
      </h2>
      <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl" aria-live="polite">
        {formatInrExact(result.emi)}
      </p>

      <div
        className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-700"
        role="img"
        aria-label={`Of every rupee paid, ${(100 - interestShare).toFixed(0)} paise is principal and ${interestShare.toFixed(0)} paise is interest`}
      >
        <div className="bg-principal" style={{ width: `${100 - interestShare}%` }} />
        <div className="bg-interest" style={{ width: `${interestShare}%` }} />
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-slate-300">Loan amount</dt>
          <dd className="text-lg font-bold">{formatInr(result.loanAmount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-300">Total interest</dt>
          <dd className="text-lg font-bold text-interest">{formatInr(result.totalInterest)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-300">Total payable</dt>
          <dd className="text-lg font-bold">{formatInr(result.totalPayment)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-slate-300">
        Interest is {interestShare.toFixed(1)}% of everything you pay back.
      </p>
    </section>
  );
}
