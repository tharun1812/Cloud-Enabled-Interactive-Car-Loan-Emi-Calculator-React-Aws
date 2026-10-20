interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  prefix?: string;
  suffix?: string;
  slider?: { min: number; max: number; step: number };
  hint?: string;
}

export default function Field({ id, label, value, onChange, error, prefix, suffix, slider, hint }: FieldProps) {
  const numeric = Number(value);
  const sliderValue = Number.isFinite(numeric) && value.trim() !== '' && slider
    ? Math.min(Math.max(numeric, slider.min), slider.max)
    : slider?.min;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <div
        className={`mt-1.5 flex items-center rounded-lg border bg-white px-3 focus-within:ring-2 ${
          error ? 'border-red-500 focus-within:ring-red-200' : 'border-slate-300 focus-within:ring-teal-200'
        }`}
      >
        {prefix && <span className="mr-2 text-slate-500">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="w-full bg-transparent py-2.5 text-base font-semibold outline-none"
        />
        {suffix && <span className="ml-2 whitespace-nowrap text-sm text-slate-500">{suffix}</span>}
      </div>
      {slider && (
        <input
          type="range"
          aria-label={`${label} slider`}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={sliderValue}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full"
        />
      )}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
