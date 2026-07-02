import { Link, Route, Routes } from 'react-router-dom';
import { PublicQueuePage } from './pages/PublicQueuePage.jsx';
import { OperatorQueuePage } from './pages/OperatorQueuePage.jsx';

function App() {
  return (
    <>
      <nav className="border-b border-slate-200 bg-white px-5 py-3">
        <div className="mx-auto flex max-w-3xl gap-4 text-sm font-medium">
          <Link className="text-slate-700 hover:text-slate-950" to="/">
            Public Queue
          </Link>
          <Link className="text-slate-700 hover:text-slate-950" to="/operator">
            Operator
          </Link>
        </div>
      </nav>
      <Routes>
        <Route element={<PublicQueuePage />} path="/" />
        <Route element={<OperatorQueuePage />} path="/operator" />
      </Routes>
    </>
  );
}

export default App;
