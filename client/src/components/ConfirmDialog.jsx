export function ConfirmDialog({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  intent = 'primary',
  isOpen,
  message,
  onCancel,
  onConfirm,
  title,
}) {
  if (!isOpen) {
    return null;
  }

  const confirmClass =
    intent === 'danger'
      ? 'rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700'
      : 'rounded-md bg-monash-blue px-4 py-2 text-sm font-semibold text-white hover:bg-monash-blue-dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-5">
      <section
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
        role="dialog"
      >
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-3 text-[15px] leading-6 text-slate-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button className={confirmClass} onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
