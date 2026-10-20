import { describe, expect, it } from 'vitest';
import { buildSchedule, calculateEmi, computeLoan, summarizeByYear, validateLoan } from './emi';
import { scheduleToCsv } from './csv';

describe('calculateEmi', () => {
  it('matches the standard formula for 10,00,000 at 10% over 60 months', () => {
    expect(calculateEmi(1_000_000, 10, 60)).toBeCloseTo(21247.04, 2);
  });

  it('matches a second reference value (5,00,000 at 8.5% over 36 months)', () => {
    expect(calculateEmi(500_000, 8.5, 36)).toBeCloseTo(15783.77, 2);
  });

  it('divides evenly when the interest rate is 0', () => {
    expect(calculateEmi(120_000, 0, 12)).toBe(10_000);
  });

  it('returns 0 for a non-positive principal or tenure', () => {
    expect(calculateEmi(0, 10, 12)).toBe(0);
    expect(calculateEmi(1000, 10, 0)).toBe(0);
  });
});

describe('buildSchedule', () => {
  const schedule = buildSchedule(1_000_000, 10, 60);

  it('has one row per month', () => {
    expect(schedule).toHaveLength(60);
  });

  it('ends with a balance of exactly 0', () => {
    expect(schedule[59].balance).toBe(0);
  });

  it('repays exactly the principal', () => {
    const repaid = schedule.reduce((s, r) => s + r.principal, 0);
    expect(repaid).toBeCloseTo(1_000_000, 2);
  });

  it('front-loads interest (first month interest > last month interest)', () => {
    expect(schedule[0].interest).toBeGreaterThan(schedule[59].interest);
  });
});

describe('computeLoan', () => {
  it('computes total interest as total payment minus loan amount', () => {
    const result = computeLoan({ carPrice: 1_200_000, downPayment: 200_000, annualRate: 10, tenureMonths: 60 });
    expect(result).not.toBeNull();
    expect(result!.loanAmount).toBe(1_000_000);
    expect(result!.totalPayment - result!.loanAmount).toBeCloseTo(result!.totalInterest, 2);
    expect(result!.years).toHaveLength(5);
  });

  it('returns null for invalid input', () => {
    expect(computeLoan({ carPrice: 100, downPayment: 100, annualRate: 10, tenureMonths: 12 })).toBeNull();
  });
});

describe('validateLoan', () => {
  const valid = { carPrice: 800_000, downPayment: 100_000, annualRate: 9, tenureMonths: 48 };

  it('accepts a valid loan', () => {
    expect(validateLoan(valid)).toEqual({});
  });

  it('rejects bad values with a message per field', () => {
    const errors = validateLoan({ carPrice: -1, downPayment: -5, annualRate: 99, tenureMonths: 0 });
    expect(Object.keys(errors).sort()).toEqual(['annualRate', 'carPrice', 'downPayment', 'tenureMonths']);
  });

  it('rejects NaN (an empty input field)', () => {
    expect(validateLoan({ ...valid, carPrice: NaN }).carPrice).toBeDefined();
  });

  it('rejects a down payment equal to the car price', () => {
    expect(validateLoan({ ...valid, downPayment: 800_000 }).downPayment).toBeDefined();
  });
});

describe('summarizeByYear and CSV export', () => {
  it('groups 36 months into 3 years', () => {
    expect(summarizeByYear(buildSchedule(300_000, 9, 36))).toHaveLength(3);
  });

  it('writes a header plus one line per month', () => {
    const csv = scheduleToCsv(buildSchedule(100_000, 8, 12));
    expect(csv.split('\n')).toHaveLength(13);
    expect(csv.startsWith('Month,EMI,Principal,Interest,Balance')).toBe(true);
  });
});
