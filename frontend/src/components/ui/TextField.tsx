type TextFieldProps = {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
};

export function TextField({ label, value, type = "text", onChange }: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-brand-cyan/10"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
