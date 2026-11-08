import { useEffect, useState } from 'react';
import Logo from './ui/Logo';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';

const links = [
  { href: '#top', label: 'Overview' },
  { href: '#features', label: 'Features' },
  { href: '#start', label: 'Get started' },
];

export default function LandingNav() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition duration-300 ${
        scrolled ? 'border-b border-white/10 bg-ink/70 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex" aria-label="Page sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-blush/70 transition hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button to="/dashboard" variant="light" pill size="sm">
              Open dashboard
            </Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" pill size="sm">
                Log in
              </Button>
              <Button to="/register" variant="light" pill size="sm">
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
