import { Link } from 'react-router-dom';
import { BarChart3, ExternalLink, MousePointerClick } from 'lucide-react';
import CopyButton from './ui/CopyButton';
import { formatNumber, hostnameOf, timeAgo } from '../utils/format';

export default function LinkRow({ link }) {
  return (
    <div className="card flex flex-col gap-4 p-4 transition hover:border-white/20 hover:bg-white/[0.07] sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <img
          src={`https://www.google.com/s2/favicons?domain=${hostnameOf(link.originalUrl)}&sz=64`}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-white/10 p-1.5"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
        <div className="min-w-0">
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="block truncate font-mono text-sm font-medium text-amber hover:underline"
          >
            {link.shortUrl.replace(/^https?:\/\//, '')}
          </a>
          <p className="truncate text-sm text-blush/70" title={link.originalUrl}>
            {link.originalUrl}
          </p>
          <p className="mt-1 text-xs text-blush/50">Created {timeAgo(link.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-sm text-white" title="Total clicks">
          <MousePointerClick className="h-4 w-4 text-amber" />
          <span className="font-semibold">{formatNumber(link.clicks)}</span>
          <span className="hidden text-blush/60 sm:inline">clicks</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={link.shortUrl} />
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open short link"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <Link
            to={`/analytics/${encodeURIComponent(link.shortCode)}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-br from-amber to-[#e58a6f] px-3 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
