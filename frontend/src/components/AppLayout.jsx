import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Link2, LogOut } from 'lucide-react';
import Logo from './ui/Logo';
import { displayName, useAuth } from '../context/AuthContext';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/links', label: 'My Links', icon: Link2 },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-white/10 text-white shadow-card' : 'text-blush/70 hover:bg-white/5 hover:text-white'
  }`;

function UserBadge({ user }) {
  const name = displayName(user);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber to-rose text-sm font-bold uppercase text-ink">
        {name.charAt(0)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        {user?.email && <p className="truncate text-xs text-blush/60">{user.email}</p>}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-bg min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-ink/60 p-5 backdrop-blur-xl lg:flex">
        <Logo to="/dashboard" />
        <nav className="mt-10 flex flex-1 flex-col gap-1.5" aria-label="Main">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-3 border-t border-white/10 pt-4">
          <UserBadge user={user} />
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-blush/70 transition hover:bg-rose/20 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo to="/dashboard" />
        <button
          onClick={logout}
          aria-label="Log out"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-sm font-medium text-white hover:bg-white/15"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-5xl animate-fade-up">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-white/10 bg-ink/90 backdrop-blur-xl lg:hidden"
        aria-label="Main"
      >
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${isActive ? 'text-amber' : 'text-blush/60'}`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
