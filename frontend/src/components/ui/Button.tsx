type ButtonProps = {
  children: React.ReactNode;
  isLoading?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  full?: boolean;
  onClick?: () => void;
};

const variants = {
  primary: "bg-brand-blue text-white hover:bg-brand-cyan",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  children,
  isLoading,
  onClick,
  full = false,
  type = "submit",
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      className={`h-11 rounded-lg px-4 font-semibold transition disabled:opacity-60 ${full ? "w-full" : ""} ${variants[variant]}`}
      disabled={isLoading}
      onClick={onClick}
      type={type}
    >
      {isLoading ? "처리 중..." : children}
    </button>
  );
}
