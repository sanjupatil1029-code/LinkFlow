import { ArrowRight } from 'lucide-react';
import FlowField from '../components/FlowField';
import LandingNav from '../components/LandingNav';
import Reveal from '../components/Reveal';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    n: '01',
    title: 'Shorten in one move',
    text: 'Paste any URL and get a clean short link, ready to copy. Missing https:// and malformed addresses are handled before anything is sent.',
  },
  {
    n: '02',
    title: 'Private by design',
    text: 'Every link is tied to your account and visible only to you. Sign in once and your session is still there when you come back.',
  },
  {
    n: '03',
    title: 'Read the signal',
    text: 'Total clicks and day-by-day trends for each link, in interactive charts you can scan at a glance.',
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryTo = isAuthenticated ? '/dashboard' : '/register';
  const primaryLabel = isAuthenticated ? 'Open dashboard' : 'Create free account';

  return (
    <div id="top" className="relative min-h-screen bg-ink">
      <FlowField />
      <div aria-hidden className="landing-veil pointer-events-none fixed inset-0" />
      <LandingNav />

      {/* Hero */}
      <section className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pb-28 pt-28 text-center">
        <p className="animate-fade-up font-mono text-[11px] uppercase tracking-[0.28em] text-blush/60">
          <span className="whitespace-nowrap">Short links</span> ·{' '}
          <span className="hidden whitespace-nowrap sm:inline">Private · </span>
          <span className="whitespace-nowrap">Click analytics</span>
        </p>

        <h1
          className="mt-7 animate-fade-up font-display text-[2.7rem] font-light leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
          style={{ animationDelay: '80ms' }}
        >
          Simplify Your link,
          <br />
          <span className="gradient-text font-normal">Amplify your Reach.</span>
        </h1>

        <p
          className="mx-auto mt-7 max-w-xl animate-fade-up text-base leading-relaxed text-blush/70 sm:text-lg"
          style={{ animationDelay: '160ms' }}
        >
          LinkFlow shortens your URLs, keeps them private to your account, and charts every click the moment it lands.
        </p>

        <div className="mt-10 flex animate-fade-up flex-wrap justify-center gap-3" style={{ animationDelay: '240ms' }}>
          <Button to={primaryTo} variant="light" pill size="lg">
            {primaryLabel}
            <ArrowRight className="h-5 w-5" />
          </Button>
          {!isAuthenticated && (
            <Button to="/login" variant="outline" pill size="lg">
              Log in
            </Button>
          )}
        </div>

        <a
          href="#features"
          className="absolute bottom-8 flex flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-blush/50 transition hover:text-white"
        >
          Scroll
          <span className="h-10 w-px bg-gradient-to-b from-blush/60 to-transparent" />
        </a>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-5xl scroll-mt-24 px-4 py-28 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_1.7fr] md:gap-16">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-amber">What it does</p>
            <h2 className="mt-5 font-display text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl">
              Built around the click.
            </h2>
          </Reveal>

          <div>
            {features.map((f, i) => (
              <Reveal key={f.n} delay={i * 90}>
                <div className="grid grid-cols-[3.25rem_1fr] gap-4 border-t border-white/10 py-9 first:border-t-0 first:pt-0 md:first:border-t md:first:pt-9">
                  <span className="pt-1.5 font-mono text-sm text-amber">{f.n}</span>
                  <div>
                    <h3 className="font-display text-2xl font-normal text-white sm:text-[1.7rem]">{f.title}</h3>
                    <p className="mt-3 max-w-lg leading-relaxed text-blush/70">{f.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section id="start" className="relative z-10 scroll-mt-24 px-4 pb-32 pt-16 text-center sm:px-6">
        <Reveal>
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-light leading-[1.08] tracking-tight text-white sm:text-6xl">
            Ready to see where your links <span className="gradient-text font-normal">go?</span>
          </h2>
          <div className="mt-10 flex justify-center">
            <Button to={primaryTo} variant="light" pill size="lg">
              {isAuthenticated ? 'Open dashboard' : 'Get started'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-ink/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <p className="font-mono text-xs text-blush/50">© {new Date().getFullYear()} LinkFlow</p>
        </div>
      </footer>
    </div>
  );
}
