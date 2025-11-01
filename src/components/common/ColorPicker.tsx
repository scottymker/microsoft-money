interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Green', value: '#10B981' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Gray', value: '#6B7280' },
];

/**
 * Color picker component with preset colors
 * Used in Categories and Savings Goals
 */
export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            className={`
              w-10 h-10 rounded-lg border-2 transition-all
              ${value === color.value
                ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            style={{ backgroundColor: color.value }}
            onClick={() => onChange(color.value)}
            title={color.name}
            aria-label={`Select ${color.name} color`}
          />
        ))}
      </div>
      {value && (
        <div className="mt-3 flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-gray-600 font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}
