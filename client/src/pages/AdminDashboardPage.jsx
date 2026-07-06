import { Link } from 'react-router-dom';

const quickLinks = [
  {
    description: 'Create events, start active queues and review event summaries.',
    label: 'Manage events',
    to: '/admin/events',
  },
  {
    description: 'Maintain the master list of faculties available for event queues.',
    label: 'Faculty list',
    to: '/admin/faculties',
  },
  {
    description: 'Create and update operator accounts for live queue calling.',
    label: 'Operators',
    to: '/admin/operators',
  },
];

export function AdminDashboardPage() {
  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-5">
        <p className="brand-kicker">Admin</p>
        <h1 className="brand-title">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Start from the operational area you need. Event analytics will appear here after the
          reporting view is expanded.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            className="brand-card block p-5 hover:border-monash-blue hover:shadow-md"
            key={link.to}
            to={link.to}
          >
            <p className="text-lg font-semibold text-monash-ink">{link.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-medium text-slate-500">Live metrics reserved for the next reporting pass.</p>
      </section>
    </>
  );
}

