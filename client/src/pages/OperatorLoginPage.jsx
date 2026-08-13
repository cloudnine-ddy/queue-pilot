import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginOperator } from '../api/authApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { PasswordField } from '../components/PasswordField.jsx';

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
    <main className="brand-page flex items-start py-12 sm:items-center sm:py-8">
      <div className="mx-auto grid w-full min-w-0 max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="hidden lg:block">
          <p className="brand-kicker">Monash Queue Pilot</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-normal text-monash-ink">
            Operator console for live queue calling.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
            Call the next number, monitor active calls and keep the faculty queue moving.
          </p>
        </section>

        <section className="brand-card min-w-0 p-6 sm:p-7">
          <header className="mb-7">
            <p className="brand-kicker">Operator</p>
            <h1 className="brand-title">Sign in</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Open your assigned faculty queue and start serving visitors.
            </p>
          </header>

          <AlertMessage message={error} />

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              className="brand-input mt-2 w-full min-w-0"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />

            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <PasswordField
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
            />

            <button
              className="brand-button-primary mt-6 w-full"
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
