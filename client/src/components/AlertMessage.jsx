export function AlertMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3.5 text-sm leading-5 text-rose-800">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-rose-500 text-xs font-bold">
        !
      </span>
      <span>{message}</span>
    </div>
  );
}
