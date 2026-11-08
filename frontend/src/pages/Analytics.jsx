import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ExternalLink, MousePointerClick, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import CopyButton from '../components/ui/CopyButton';
import { ErrorState, Spinner } from '../components/ui/Feedback';
import { linksApi } from '../api/services';
import { formatDate, formatDateTime, formatNumber, getErrorMessage } from '../utils/format';
import { chartTooltip } from './Dashboard';

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: 'All', days: Infinity },
];

export default function Analytics() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { message, notFound }
  const [range, setRange] = useState(RANGES[1]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await linksApi.stats(shortCode));
    } catch (err) {
      const status = err.response?.status;
      setError({
        notFound: status === 404 || status === 403,
        message: getErrorMessage(err, 'Could not load analytics for this link.'),
      });
    } finally {
      setLoading(false);
    }
  }, [shortCode]);

  useEffect(() => {
    load();
  }, [load]);

  const series = useMemo(() => {
    if (!data) return [];
    return Number.isFinite(range.days) ? data.daily.slice(-range.days) : data.daily;
  }, [data, range]);

  const summary = useMemo(() => {
    if (!data) return null;
    const last7 = data.daily.slice(-7).reduce((s, d) => s + d.clicks, 0);
    const today = data.daily[data.daily.length - 1]?.clicks || 0;
    const peak = data.daily.reduce((best, d) => (d.clicks > (best?.clicks ?? -1) ? d : best), null);
    return { last7, today, peak };
  }, [data]);

  const back = (
    <Button to="/links" variant="ghost" size="sm" className="-ml-2 mb-4">
      <ArrowLeft className="h-4 w-4" /> Back to My Links
    </Button>
  );

  if (loading) {
    return (
      <>
        {back}
        <Spinner label="Loading analytics…" />
      </>
    );
  }

  if (error) {
    return (
      <>
        {back}
        <ErrorState
          title={error.notFound ? 'Link not found' : 'Could not load analytics'}
          message={error.notFound ? "This link doesn't exist or doesn't belong to your account." : error.message}
          onRetry={error.notFound ? undefined : load}
        />
      </>
    );
  }

  const { link, totalClicks, breakdowns, recent } = data;
  const maxClicks = Math.max(...series.map((d) => d.clicks), 0);

  return (
    <>
      {back}
      <PageHeader
        title="Link analytics"
        subtitle={`Performance for /${link.shortCode}`}
        actions={
          <>
            <CopyButton text={link.shortUrl} label />
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 text-sm font-medium text-white transition hover:bg-white/20"
            >
              <ExternalLink className="h-4 w-4" /> Visit
            </a>
          </>
        }
      />

      <div className="card mb-6 p-5">
        <p className="font-mono text-sm font-medium text-amber">{link.shortUrl.replace(/^https?:\/\//, '')}</p>
        <p className="mt-1 break-all text-sm text-blush/70">{link.originalUrl}</p>
        {link.createdAt && <p className="mt-2 text-xs text-blush/50">Created {formatDate(link.createdAt)}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MousePointerClick} label="Total clicks" value={formatNumber(totalClicks)} />
        <StatCard icon={TrendingUp} label="Last 7 days" value={formatNumber(summary.last7)} sub={`${formatNumber(summary.today)} today`} />
        <StatCard
          icon={CalendarDays}
          label="Best day"
          value={summary.peak && summary.peak.clicks > 0 ? summary.peak.date : '—'}
          sub={summary.peak && summary.peak.clicks > 0 ? `${formatNumber(summary.peak.clicks)} clicks` : 'No clicks yet'}
        />
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">Clicks over time</h2>
          <div className="inline-flex rounded-xl border border-white/10 bg-ink/60 p-1" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r)}
                aria-pressed={range.label === r.label}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                  range.label === r.label ? 'bg-amber text-ink' : 'text-blush/70 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {totalClicks === 0 && maxClicks === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <MousePointerClick className="mb-3 h-8 w-8 text-blush/40" />
            <p className="font-semibold text-white">No clicks yet</p>
            <p className="mt-1 max-w-xs text-sm text-blush/60">Share your short link and click data will appear here.</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ED9E59" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#ED9E59" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip {...chartTooltip} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} formatter={(v) => [formatNumber(v), 'Clicks']} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#ED9E59"
                  strokeWidth={2.5}
                  fill="url(#clickFill)"
                  activeDot={{ r: 5, fill: '#ED9E59', stroke: '#1B1931', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {breakdowns.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {breakdowns.map((b) => {
            const top = b.data[0]?.value || 1;
            return (
              <section key={b.key} className="card p-5">
                <h3 className="mb-4 font-bold text-white">{b.label}</h3>
                <ul className="space-y-3">
                  {b.data.map((row) => (
                    <li key={row.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="truncate text-blush">{row.name}</span>
                        <span className="font-semibold text-white">{formatNumber(row.value)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose to-amber"
                          style={{ width: `${(row.value / top) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {recent.length > 0 && (
        <section className="card mt-6 p-5">
          <h3 className="mb-3 font-bold text-white">Recent clicks</h3>
          <ul className="divide-y divide-white/10">
            {recent.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-white">{formatDateTime(c.time)}</span>
                <span className="truncate text-blush/60">
                  {[c.country, c.device, c.browser].filter(Boolean).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-center text-sm text-blush/50">
        <Link to="/dashboard" className="hover:text-blush">
          Back to dashboard
        </Link>
      </p>
    </>
  );
}
