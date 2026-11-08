import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorState, FullPageSpinner } from './ui/Feedback';
import { getErrorMessage } from '../utils/format';

/** Wraps routes that require a signed-in user. */
export function ProtectedRoute() {
  const { status, bootError, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner label="Restoring your session…" />;

  if (status === 'error') {
    return (
      <div className="app-bg flex min-h-screen items-center justify-center p-6">
        <ErrorState
          title="Can't reach LinkFlow"
          message={getErrorMessage(bootError)}
          onRetry={retry}
          className="max-w-lg"
        />
      </div>
    );
  }

  if (status !== 'authed') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Login / register pages: signed-in users get sent to the dashboard. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authed') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
