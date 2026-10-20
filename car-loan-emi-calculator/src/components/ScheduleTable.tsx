import { useState } from 'react';
import type { LoanResult } from '../lib/emi';
import { downloadCsv, scheduleToCsv } from '../lib/csv';
import { formatInrExact } from '../lib/format';

export default function ScheduleTable({ result }: { result: LoanResult }) {
  const [openYear, setOpenYear] = useState<number | null>(null);

  return (
    <section aria-labelledby="schedule-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="schedule-heading" className="text-lg font-bold">
          Repayment schedule
        </h2>
        <button
          type="button"
          onClick={() => downloadCsv('emi-schedule.csv', scheduleToCsv(result.schedule))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        >
          Download CSV
        </button>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Period</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Principal</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Interest</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {result.years.map((y) => {
              const expanded = openYear === y.year;
              const months = result.schedule.filter((m) => Math.ceil(m.month / 12) === y.year);
              return (
                <YearRows
                  key={y.year}
                  year={y.year}
                  expanded={expanded}
                  onToggle={() => setOpenYear(expanded ? null : y.year)}
                  principal={y.principal}
                  interest={y.interest}
                  balance={y.closingBalance}
                  months={months}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface YearRowsProps {
  year: number;
  expanded: boolean;
  onToggle: () => void;
  principal: number;
  interest: number;
  balance: number;
  months: LoanResult['schedule'];
}

function YearRows({ year, expanded, onToggle, principal, interest, balance, months }: YearRowsProps) {
  return (
    <>
      <tr className="border-t border-slate-200">
        <td className="px-4 py-2.5">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            Year {year} {expanded ? '(hide months)' : '(show months)'}
          </button>
        </td>
        <td className="px-4 py-2.5 text-right">{formatInrExact(principal)}</td>
        <td className="px-4 py-2.5 text-right">{formatInrExact(interest)}</td>
        <td className="px-4 py-2.5 text-right">{formatInrExact(balance)}</td>
      </tr>
      {expanded &&
        months.map((m) => (
          <tr key={m.month} className="border-t border-slate-100 bg-slate-50 text-slate-700">
            <td className="px-4 py-2 pl-8">Month {m.month}</td>
            <td className="px-4 py-2 text-right">{formatInrExact(m.principal)}</td>
            <td className="px-4 py-2 text-right">{formatInrExact(m.interest)}</td>
            <td className="px-4 py-2 text-right">{formatInrExact(m.balance)}</td>
          </tr>
        ))}
    </>
  );
}
