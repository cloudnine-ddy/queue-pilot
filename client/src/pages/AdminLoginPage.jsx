import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/authApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { PasswordField } from '../components/PasswordField.jsx';
import { adminSessionKey } from './adminSession.js';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@queuepilot.test');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');

      const session = await loginAdmin(email, password);
      localStorage.setItem(adminSessionKey, JSON.stringify(session));
      navigate('/admin');
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
            Admin operations for event queue management.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
            Manage events, faculties, operator access and event summaries from one focused
            workspace.
          </p>
        </section>

        <section className="brand-card min-w-0 p-6 sm:p-7">
          <header className="mb-7">
            <p className="brand-kicker">Admin</p>
            <h1 className="brand-title">Sign in</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Manage event setup, staffing and live queue activity.
            </p>
          </header>

          <AlertMessage message={error} />

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700" htmlFor="admin-email">
              Email
            </label>
            <input
              className="brand-input mt-2 w-full min-w-0"
              id="admin-email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />

            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="admin-password">
              Password
            </label>
            <PasswordField
              id="admin-password"
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

