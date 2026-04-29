import { NavLink, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        'rounded-md px-3 py-1.5 text-sm font-medium transition ' +
        (isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200')
      }
    >
      {children}
    </NavLink>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">U</div>
            <div>
              <div className="text-sm font-semibold text-slate-900">UPSC Quiz</div>
              <div className="text-xs text-slate-500">Practice · Review · Track</div>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/analytics">Analytics</NavItem>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400">
        Plug-and-play UPSC quiz — upload a JSON bank to get started.
      </footer>
    </div>
  );
}
