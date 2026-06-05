type ConfirmModalProps = {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({ title, message, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 px-4">
      <section className="w-full max-w-sm rounded-lg bg-white p-6 shadow-panel">
        <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={onCancel}>
            취소
          </button>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white" onClick={onConfirm}>
            삭제
          </button>
        </div>
      </section>
    </div>
  );
}
