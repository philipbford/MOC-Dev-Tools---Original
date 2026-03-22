/**
 * Reusable labelled form field wrapper.
 */
export function FormField({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white';

export function TextInput({ value, onChange, placeholder, ...rest }) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
    />
  );
}

export function NumberInput({ value, onChange, placeholder, ...rest }) {
  return (
    <input
      type="number"
      className={inputCls}
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      placeholder={placeholder}
      {...rest}
    />
  );
}

export function DateInput({ value, onChange, ...rest }) {
  return (
    <input
      type="date"
      className={inputCls}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      {...rest}
    />
  );
}

export function SelectInput({ value, onChange, options, placeholder = '— select —' }) {
  return (
    <select
      className={inputCls}
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function TextAreaInput({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      className={`${inputCls} resize-y`}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
    />
  );
}

export function CheckboxInput({ value, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600"
      />
      {label}
    </label>
  );
}
