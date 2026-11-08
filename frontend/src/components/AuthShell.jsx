import { Link } from 'react-router-dom';
import { BarChart3, Lock, Zap } from 'lucide-react';
import Logo from './ui/Logo';

const points = [
  { icon: Zap, text: 'Shorten any URL in a second' },
  { icon: Lock, text: 'Your links stay private to your account' },
  { icon: BarChart3, text: 'See clicks over time, per link' },
];

/** Split layout shared by Login and Register. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="app-bg grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <Logo />
        <div className="relative z-10">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight text-white">
            Short links. <span className="gradient-text">Clear answers.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-blush/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-amber">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-plum/60 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-amber/20 blur-3xl" />
        <p className="relative z-10 text-sm text-blush/50">© {new Date().getFullYear()} LinkFlow</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <div className="card p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
            <p className="mt-1 text-sm text-blush/70">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-6 text-center text-sm text-blush/70">{footer}</p>
          <p className="mt-3 text-center text-xs text-blush/40">
            <Link to="/" className="hover:text-blush">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
