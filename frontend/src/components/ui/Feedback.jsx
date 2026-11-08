import { AlertTriangle, Loader2 } from 'lucide-react';
import Button from './Button';

export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-blush/70 ${className}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-amber" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function FullPageSpinner({ label }) {
  return (
    <div className="app-bg flex min-h-screen items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }) {
  return (
    <div className={`card flex flex-col items-center px-6 py-12 text-center ${className}`} role="alert">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose/20 text-rose">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {message && <p className="mt-1.5 max-w-md text-sm text-blush/70">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action, className = '' }) {
  return (
    <div className={`card flex flex-col items-center px-6 py-14 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-grape to-plum text-amber">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-blush/70">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
