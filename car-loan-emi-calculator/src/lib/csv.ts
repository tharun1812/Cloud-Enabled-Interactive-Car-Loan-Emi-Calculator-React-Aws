import type { ScheduleRow } from './emi';

export function scheduleToCsv(rows: ScheduleRow[]): string {
  const header = 'Month,EMI,Principal,Interest,Balance';
  const lines = rows.map((r) => [r.month, r.emi, r.principal, r.interest, r.balance].join(','));
  return [header, ...lines].join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
