import type { YearSummary } from '../lib/emi';
import { formatInr } from '../lib/format';

interface Props {
  years: YearSummary[];
}

const W = 640;
const H = 240;
const PAD = { top: 12, right: 8, bottom: 28, left: 8 };

/** Stacked bars: how much of each year's payments goes to principal vs interest. */
export default function YearlyChart({ years }: Props) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxTotal = Math.max(...years.map((y) => y.principal + y.interest), 1);
  const slot = innerW / years.length;
  const barW = Math.min(slot * 0.62, 64);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Yearly split of principal and interest paid"
        className="h-auto w-full"
      >
        {years.map((y, i) => {
          const x = PAD.left + slot * i + (slot - barW) / 2;
          const principalH = (y.principal / maxTotal) * innerH;
          const interestH = (y.interest / maxTotal) * innerH;
          const baseY = PAD.top + innerH;
          return (
            <g key={y.year}>
              <title>{`Year ${y.year}: principal ${formatInr(y.principal)}, interest ${formatInr(y.interest)}`}</title>
              <rect x={x} y={baseY - principalH} width={barW} height={principalH} fill="#0e7c7b" />
              <rect x={x} y={baseY - principalH - interestH} width={barW} height={interestH} fill="#e0a526" />
              <text x={x + barW / 2} y={H - 9} textAnchor="middle" fontSize="12" fill="#475569">
                {`Y${y.year}`}
              </text>
            </g>
          );
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH} y2={PAD.top + innerH} stroke="#cbd5e1" />
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-principal" /> Principal repaid
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-interest" /> Interest paid
        </span>
      </figcaption>
    </figure>
  );
}
