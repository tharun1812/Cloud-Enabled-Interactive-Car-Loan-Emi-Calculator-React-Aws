/**
 * Pure EMI / amortization maths. No UI code here, so it is easy to test.
 *
 *   EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 *   P = loan principal, r = monthly rate (annual % / 12 / 100), n = months
 */

export interface LoanInput {
  carPrice: number;
  downPayment: number;
  annualRate: number; // percent per year, e.g. 9.5
  tenureMonths: number;
}

export interface ScheduleRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface YearSummary {
  year: number;
  principal: number;
  interest: number;
  closingBalance: number;
}

export interface LoanResult {
  loanAmount: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: ScheduleRow[];
  years: YearSummary[];
}

export type LoanErrors = Partial<Record<keyof LoanInput, string>>;

export const LIMITS = {
  maxPrice: 1_000_000_000,
  maxRate: 40,
  maxTenureMonths: 120,
} as const;

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculateEmi(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return round2(principal / months);
  const growth = Math.pow(1 + r, months);
  return round2((principal * r * growth) / (growth - 1));
}

export function validateLoan(input: LoanInput): LoanErrors {
  const errors: LoanErrors = {};
  const { carPrice, downPayment, annualRate, tenureMonths } = input;

  if (!Number.isFinite(carPrice) || carPrice <= 0) {
    errors.carPrice = 'Enter a car price greater than 0.';
  } else if (carPrice > LIMITS.maxPrice) {
    errors.carPrice = 'Car price is too large.';
  }

  if (!Number.isFinite(downPayment) || downPayment < 0) {
    errors.downPayment = 'Enter 0 or more.';
  } else if (!errors.carPrice && downPayment >= carPrice) {
    errors.downPayment = 'Down payment must be less than the car price.';
  }

  if (!Number.isFinite(annualRate) || annualRate < 0) {
    errors.annualRate = 'Enter an interest rate of 0 or more.';
  } else if (annualRate > LIMITS.maxRate) {
    errors.annualRate = `Rate cannot exceed ${LIMITS.maxRate}%.`;
  }

  if (!Number.isInteger(tenureMonths) || tenureMonths < 1) {
    errors.tenureMonths = 'Tenure must be at least 1 month.';
  } else if (tenureMonths > LIMITS.maxTenureMonths) {
    errors.tenureMonths = `Tenure cannot exceed ${LIMITS.maxTenureMonths / 12} years.`;
  }

  return errors;
}

export function buildSchedule(principal: number, annualRate: number, months: number): ScheduleRow[] {
  const emi = calculateEmi(principal, annualRate, months);
  const r = annualRate / 12 / 100;
  const rows: ScheduleRow[] = [];
  let balance = round2(principal);

  for (let month = 1; month <= months; month++) {
    const interest = round2(balance * r);
    let principalPart = round2(emi - interest);
    let payment = emi;

    // The last instalment absorbs rounding drift so the balance ends at exactly 0.
    if (month === months) {
      principalPart = balance;
      payment = round2(principalPart + interest);
    }

    balance = round2(balance - principalPart);
    rows.push({ month, emi: payment, principal: principalPart, interest, balance });
  }
  return rows;
}

export function summarizeByYear(schedule: ScheduleRow[]): YearSummary[] {
  const map = new Map<number, YearSummary>();
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    const entry = map.get(year) ?? { year, principal: 0, interest: 0, closingBalance: 0 };
    entry.principal = round2(entry.principal + row.principal);
    entry.interest = round2(entry.interest + row.interest);
    entry.closingBalance = row.balance;
    map.set(year, entry);
  }
  return [...map.values()];
}

/** Returns null when the input is invalid (use validateLoan to find out why). */
export function computeLoan(input: LoanInput): LoanResult | null {
  if (Object.keys(validateLoan(input)).length > 0) return null;

  const loanAmount = round2(input.carPrice - input.downPayment);
  const schedule = buildSchedule(loanAmount, input.annualRate, input.tenureMonths);
  const totalPayment = round2(schedule.reduce((sum, row) => sum + row.emi, 0));

  return {
    loanAmount,
    emi: calculateEmi(loanAmount, input.annualRate, input.tenureMonths),
    totalInterest: round2(totalPayment - loanAmount),
    totalPayment,
    schedule,
    years: summarizeByYear(schedule),
  };
}
