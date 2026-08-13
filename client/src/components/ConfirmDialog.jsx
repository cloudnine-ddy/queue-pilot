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
      ? 'rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700'
      : 'rounded-2xl bg-monash-blue px-5 py-3 text-sm font-semibold text-white hover:bg-monash-blue-dark';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 px-4 pb-4 backdrop-blur-[2px] sm:items-center sm:pb-0">
      <section
        aria-modal="true"
        className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <h2 className="text-xl font-bold tracking-[-0.015em] text-monash-ink">{title}</h2>
        <p className="mt-3 text-[15px] leading-6 text-slate-600">{message}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="brand-button-secondary"
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
