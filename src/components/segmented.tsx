"use client";

type SegmentedOption = {
  id: string;
  label: React.ReactNode;
  count?: number;
};

type SegmentedProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
};

export function Segmented({ options, value, onChange, label, className = "" }: SegmentedProps) {
  return (
    <div role="group" aria-label={label} className={`segmented ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
          className="segmented-item"
        >
          <span>{opt.label}</span>
          {opt.count !== undefined && (
            <span className="segmented-count tabular-nums">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
