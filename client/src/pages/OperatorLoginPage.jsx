import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginOperator } from '../api/authApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';

const operatorSessionKey = 'queuePilot.operatorSession';

export function OperatorLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('engineering.operator@queuepilot.test');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');

      const session = await loginOperator(email, password);
      localStorage.setItem(operatorSessionKey, JSON.stringify(session));
      navigate('/operator');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-md">
        <header className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Operator
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            Sign in
          </h1>
        </header>

        <AlertMessage message={error} />

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />

            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />

            <button
              className="mt-6 w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export { operatorSessionKey };
