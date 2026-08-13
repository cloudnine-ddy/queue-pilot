import { useState } from 'react';

function EyeIcon({ isVisible }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {isVisible ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="m2 2 20 20" />
          <path d="M6.7 6.7C3.7 8.7 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.4" />
          <path d="M9.9 4.3C10.6 4.1 11.3 4 12 4c6.5 0 10 8 10 8a16.1 16.1 0 0 1-3.1 4.1" />
        </>
      )}
    </svg>
  );
}

export function PasswordField({ id, onChange, value }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative mt-2">
      <input
        className="brand-input min-w-0 w-full pr-12"
        id={id}
        onChange={onChange}
        type={isVisible ? 'text' : 'password'}
        value={value}
      />
      <button
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-monash-blue-soft hover:text-monash-blue"
        onClick={() => setIsVisible((value) => !value)}
        type="button"
      >
        <EyeIcon isVisible={isVisible} />
      </button>
    </div>
  );
}
