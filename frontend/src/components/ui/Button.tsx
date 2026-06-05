type ButtonProps = {
  children: React.ReactNode;
  isLoading?: boolean;
};

export function Button({ children, isLoading }: ButtonProps) {
  return (
    <button
      className="h-11 w-full rounded-lg bg-brand-blue font-semibold text-white transition hover:bg-brand-cyan disabled:opacity-60"
      disabled={isLoading}
      type="submit"
    >
      {isLoading ? "처리 중..." : children}
    </button>
  );
}
