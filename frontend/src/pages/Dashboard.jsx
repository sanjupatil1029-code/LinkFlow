import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Link2, MousePointerClick, Trophy } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../components/ui/Feedback';
import ShortenForm from '../components/ShortenForm';
import LinkRow from '../components/LinkRow';
import useLinks from '../hooks/useLinks';
import { displayName, useAuth } from '../context/AuthContext';
import { formatNumber } from '../utils/format';

const BAR_COLORS = ['#ED9E59', '#e58a6f', '#A34054', '#c0506a', '#662249'];

export const chartTooltip = {
  contentStyle: {
    background: '#1B1931',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 13,
  },
  labelStyle: { color: '#E9C8C8' },
  cursor: { fill: 'rgba(255,255,255,0.05)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { links, loading, error, reload, addLink } = useLinks();

  const stats = useMemo(() => {
    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
    const top = links.reduce((best, l) => (!best || l.clicks > best.clicks ? l : best), null);
    const topLinks = [...links]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((l) => ({ name: l.shortCode, clicks: l.clicks }));
    return { totalClicks, top, topLinks };
  }, [links]);

  const recent = links.slice(0, 4);
  const hasClicks = stats.totalClicks > 0;

  return (
    <>
      <PageHeader title={`Hello, ${displayName(user)} 👋`} subtitle="Here's how your links are performing." />

      <ShortenForm onCreated={addLink} />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Link2} label="Total links" value={formatNumber(links.length)} loading={loading} />
        <StatCard icon={MousePointerClick} label="Total clicks" value={formatNumber(stats.totalClicks)} loading={loading} />
        <StatCard
          icon={Trophy}
          label="Top link"
          value={stats.top && stats.top.clicks > 0 ? stats.top.shortCode : '—'}
          sub={stats.top && stats.top.clicks > 0 ? `${formatNumber(stats.top.clicks)} clicks` : 'No clicks yet'}
          loading={loading}
        />
      </div>

      {error ? (
        <ErrorState className="mt-6" message={error} onRetry={reload} />
      ) : loading ? (
        <Spinner label="Loading your links…" />
      ) : links.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Link2}
          title="No links yet"
          message="Paste a URL above to create your first short link. It will show up here."
        />
      ) : (
        <>
          <section className="card mt-6 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber" />
              <h2 className="text-lg font-bold text-white">Top links by clicks</h2>
            </div>
            {hasClicks ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topLinks} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip {...chartTooltip} formatter={(v) => [formatNumber(v), 'Clicks']} />
                    <Bar dataKey="clicks" radius={[8, 8, 0, 0]} maxBarSize={56}>
                      {stats.topLinks.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-blush/60">
                No clicks recorded yet. Share a link and the chart will fill in.
              </p>
            )}
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recent links</h2>
              <Button to="/links" variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {recent.map((l) => (
                <LinkRow key={l.shortCode} link={l} />
              ))}
            </div>
            {links.length > recent.length && (
              <p className="mt-4 text-center text-sm text-blush/60">
                Showing {recent.length} of {links.length}.{' '}
                <Link to="/links" className="font-medium text-amber hover:underline">
                  See all links
                </Link>
              </p>
            )}
          </section>
        </>
      )}
    </>
  );
}
