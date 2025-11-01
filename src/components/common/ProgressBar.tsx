interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

/**
 * Progress bar component for displaying goal/budget progress
 * Used in Savings Goals and Budget tracking
 */
export default function ProgressBar({
  current,
  target,
  color = '#3B82F6',
  label,
  showPercentage = true
}: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOverTarget = current > target;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: isOverTarget ? '#EF4444' : color
          }}
        />
      </div>

      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500">
          ${current.toFixed(2)}
        </span>
        <span className="text-xs text-gray-500">
          ${target.toFixed(2)}
        </span>
      </div>

      {isOverTarget && (
        <p className="text-xs text-red-600 mt-1">
          Over target by ${(current - target).toFixed(2)}
        </p>
      )}
    </div>
  );
}
