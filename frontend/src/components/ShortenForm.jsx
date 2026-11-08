import { useState } from 'react';
import { Link2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import CopyButton from './ui/CopyButton';
import { linksApi } from '../api/services';
import { ensureProtocol, getErrorMessage, isValidUrl } from '../utils/format';

export default function ShortenForm({ onCreated }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const target = ensureProtocol(url);
    if (!isValidUrl(target)) {
      setError('Enter a valid URL, e.g. https://example.com/long/path');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const link = await linksApi.shorten(target);
      setResult(link);
      setUrl('');
      onCreated?.(link);
      toast.success('Short link created');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not shorten that URL.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber" />
        <h2 className="text-lg font-bold text-white">Shorten a new link</h2>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blush/50" aria-hidden />
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="Paste your long URL here…"
            aria-label="URL to shorten"
            aria-invalid={!!error}
            className={`field h-11 pl-10 ${error ? 'border-rose focus:border-rose focus:ring-rose/20' : ''}`}
          />
        </div>
        <Button type="submit" loading={loading} className="sm:w-40">
          Shorten
        </Button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-[#f08a9d]" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber/30 bg-amber/10 p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-amber">Your short link</p>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="block truncate font-mono text-sm text-white hover:underline"
            >
              {result.shortUrl}
            </a>
          </div>
          <CopyButton text={result.shortUrl} label />
        </div>
      )}
    </div>
  );
}
