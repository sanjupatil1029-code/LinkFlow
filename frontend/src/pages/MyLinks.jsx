import { useMemo, useState } from 'react';
import { Link2, RefreshCw, Search, SearchX } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState, Spinner } from '../components/ui/Feedback';
import LinkRow from '../components/LinkRow';
import useLinks from '../hooks/useLinks';
import { parseDate } from '../utils/format';

const SORTS = {
  newest: { label: 'Newest first', fn: (a, b) => (parseDate(b.createdAt) || 0) - (parseDate(a.createdAt) || 0) },
  oldest: { label: 'Oldest first', fn: (a, b) => (parseDate(a.createdAt) || 0) - (parseDate(b.createdAt) || 0) },
  clicks: { label: 'Most clicks', fn: (a, b) => b.clicks - a.clicks },
};

export default function MyLinks() {
  const { links, loading, error, reload, addLink } = useLinks();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? links.filter((l) => l.originalUrl.toLowerCase().includes(q) || l.shortCode.toLowerCase().includes(q))
      : links;
    return [...filtered].sort(SORTS[sort].fn);
  }, [links, query, sort]);

  const refresh = async () => {
    setRefreshing(true);
    await reload({ silent: true });
    setRefreshing(false);
  };

  return (
    <>
      <PageHeader
        title="My Links"
        subtitle="Every link you've created. Only you can see these."
        actions={
          <Button variant="secondary" size="sm" onClick={refresh} loading={refreshing} disabled={loading}>
            {!refreshing && <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        }
      />


      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <Spinner label="Loading your links…" />
        ) : links.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="You haven't created any links yet"
            message="Use the form above to shorten your first URL."
          />
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blush/50" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by URL or short code…"
                  aria-label="Search links"
                  className="field h-11 pl-10"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort links"
                className="field h-11 sm:w-48"
              >
                {Object.entries(SORTS).map(([key, { label }]) => (
                  <option key={key} value={key} className="bg-ink">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <p className="mb-3 text-sm text-blush/60">
              {visible.length} {visible.length === 1 ? 'link' : 'links'}
              {query && ` matching “${query}”`}
            </p>

            {visible.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No matching links"
                message="Try a different search term."
                action={
                  <Button variant="secondary" size="sm" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {visible.map((l) => (
                  <LinkRow key={l.shortCode} link={l} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
