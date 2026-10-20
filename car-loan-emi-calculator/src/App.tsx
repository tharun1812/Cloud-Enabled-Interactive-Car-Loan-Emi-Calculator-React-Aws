import { useMemo, useState } from 'react';
import Field from './components/Field';
import Summary from './components/Summary';
import YearlyChart from './components/YearlyChart';
import ScheduleTable from './components/ScheduleTable';
import { computeLoan, validateLoan, type LoanInput } from './lib/emi';

type TenureUnit = 'years' | 'months';

export default function App() {
  const [carPrice, setCarPrice] = useState('1200000');
  const [downPayment, setDownPayment] = useState('240000');
  const [rate, setRate] = useState('9.5');
  const [tenure, setTenure] = useState('5');
  const [unit, setUnit] = useState<TenureUnit>('years');

  const input: LoanInput = useMemo(() => {
    const t = Number(tenure);
    return {
      carPrice: carPrice.trim() === '' ? NaN : Number(carPrice),
      downPayment: downPayment.trim() === '' ? NaN : Number(downPayment),
      annualRate: rate.trim() === '' ? NaN : Number(rate),
      tenureMonths: tenure.trim() === '' ? NaN : unit === 'years' ? Math.round(t * 12) : t,
    };
  }, [carPrice, downPayment, rate, tenure, unit]);

  const errors = useMemo(() => validateLoan(input), [input]);
  const result = useMemo(() => computeLoan(input), [input]);

  const tenureSlider = unit === 'years' ? { min: 1, max: 10, step: 1 } : { min: 6, max: 120, step: 1 };

  function switchUnit(next: TenureUnit) {
    if (next === unit) return;
    const t = Number(tenure);
    if (Number.isFinite(t) && tenure.trim() !== '') {
      setTenure(String(next === 'months' ? Math.round(t * 12) : Math.max(1, Math.round(t / 12))));
    }
    setUnit(next);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Car loan EMI calculator</h1>
        <p className="mt-2 text-slate-600">
          See what you will pay each month, how much interest the loan costs, and how the balance falls over time.
        </p>
      </header>

      <main className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <form className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={(e) => e.preventDefault()} aria-label="Loan details">
          <Field
            id="car-price"
            label="Car price"
            prefix="₹"
            value={carPrice}
            onChange={setCarPrice}
            error={errors.carPrice}
            slider={{ min: 200000, max: 5000000, step: 10000 }}
          />
          <Field
            id="down-payment"
            label="Down payment"
            prefix="₹"
            value={downPayment}
            onChange={setDownPayment}
            error={errors.downPayment}
            slider={{ min: 0, max: Math.max(Number(carPrice) || 0, 1), step: 5000 }}
          />
          <Field
            id="rate"
            label="Interest rate"
            suffix="% per year"
            value={rate}
            onChange={setRate}
            error={errors.annualRate}
            slider={{ min: 5, max: 20, step: 0.1 }}
          />
          <div>
            <Field
              id="tenure"
              label="Loan tenure"
              suffix={unit}
              value={tenure}
              onChange={setTenure}
              error={errors.tenureMonths}
              slider={tenureSlider}
            />
            <div className="mt-2 inline-flex rounded-lg border border-slate-300 p-0.5" role="group" aria-label="Tenure unit">
              {(['years', 'months'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => switchUnit(u)}
                  aria-pressed={unit === u}
                  className={`rounded-md px-3 py-1 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    unit === u ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {u === 'years' ? 'Years' : 'Months'}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="space-y-8">
          {result ? (
            <>
              <Summary result={result} />
              <section aria-labelledby="chart-heading">
                <h2 id="chart-heading" className="mb-3 text-lg font-bold">
                  Where each year&rsquo;s payments go
                </h2>
                <YearlyChart years={result.years} />
              </section>
              <ScheduleTable result={result} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
              Fix the highlighted fields to see your EMI.
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 text-sm text-slate-500">
        EMI = P × r × (1 + r)<sup>n</sup> ÷ ((1 + r)<sup>n</sup> − 1), where r is the monthly rate and n the number of
        months. Figures are estimates; a lender&rsquo;s fees and rounding may differ.
      </footer>
    </div>
  );
}
