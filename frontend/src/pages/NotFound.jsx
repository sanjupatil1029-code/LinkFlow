import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

export default function NotFound() {
  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-10" />
      <p className="gradient-text text-7xl font-extrabold">404</p>
      <h1 className="mt-3 text-2xl font-bold text-white">This page doesn't exist</h1>
      <p className="mt-2 max-w-sm text-blush/70">The link you followed may be broken, or the page may have moved.</p>
      <Button to="/" className="mt-8">
        Back to home
      </Button>
    </div>
  );
}
