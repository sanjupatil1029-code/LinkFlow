import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';

export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="LinkFlow home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber to-rose shadow-glow">
        <Link2 className="h-5 w-5 text-ink" strokeWidth={2.6} />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-white">
        Link<span className="gradient-text">Flow</span>
      </span>
    </Link>
  );
}
