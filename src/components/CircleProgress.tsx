interface Props {
  value: number;      // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function CircleProgress({ value, size = 140, strokeWidth = 12, label }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#FFE4EC" strokeWidth={strokeWidth} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="url(#grad)" strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8FB1" />
            <stop offset="100%" stopColor="#B8A4EC" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">
          {Math.round(value)}%
        </span>
        {label && <span className="text-xs text-ink-500 dark:text-rose-200">{label}</span>}
      </div>
    </div>
  );
}
