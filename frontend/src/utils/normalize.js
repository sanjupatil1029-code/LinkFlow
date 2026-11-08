import { buildShortUrl, parseDate } from './format';

/**
 * The backend's exact response field names aren't fixed in the frontend, so these
 * helpers map the common shapes onto one internal model. Adjust here if needed.
 */

const firstArray = (...candidates) => candidates.find((c) => Array.isArray(c)) || null;

export function normalizeLink(raw = {}) {
  const shortCode =
    raw.short_code ?? raw.shortCode ?? raw.code ?? raw.alias ?? (raw.short_url ? String(raw.short_url).split('/').filter(Boolean).pop() : '');

  const rawShort = raw.short_url ?? raw.shortUrl ?? raw.shortened_url;
  const shortUrl = rawShort && /^https?:\/\//i.test(rawShort) ? rawShort : buildShortUrl(shortCode);

  const clickSource = raw.click_count ?? raw.clicks ?? raw.total_clicks ?? raw.clickCount ?? 0;
  const clicks = Array.isArray(clickSource) ? clickSource.length : Number(clickSource) || 0;

  return {
    id: raw.id ?? shortCode,
    shortCode,
    originalUrl: raw.original_url ?? raw.originalUrl ?? raw.long_url ?? raw.url ?? raw.target_url ?? '',
    shortUrl,
    clicks,
    createdAt: raw.created_at ?? raw.createdAt ?? raw.created ?? null,
  };
}

export function normalizeLinks(data) {
  const list = firstArray(data, data?.links, data?.items, data?.results, data?.data) || [];
  return list.map(normalizeLink).filter((l) => l.shortCode);
}

const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Fill missing days between the first data point and today so charts have no gaps. */
function fillDays(counts, minDays = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys = Object.keys(counts).sort();
  let start = new Date(today);
  start.setDate(start.getDate() - (minDays - 1));
  if (keys.length) {
    const [y, m, d] = keys[0].split('-').map(Number);
    const first = new Date(y, m - 1, d);
    if (first < start) start = first;
  }
  const out = [];
  for (let cur = new Date(start); cur <= today; cur.setDate(cur.getDate() + 1)) {
    const key = dayKey(cur);
    out.push({
      key,
      date: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: counts[key] || 0,
    });
  }
  return out;
}

const EVENT_TIME_KEYS = ['clicked_at', 'timestamp', 'created_at', 'time', 'date', 'visited_at'];
const BREAKDOWNS = [
  { key: 'country', label: 'Countries' },
  { key: 'device', label: 'Devices' },
  { key: 'browser', label: 'Browsers' },
  { key: 'os', label: 'Operating systems' },
  { key: 'referrer', label: 'Referrers' },
];

function toBreakdownList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => ({
        name: String(v.name ?? v.label ?? v.key ?? v.value ?? 'Unknown'),
        value: Number(v.count ?? v.clicks ?? v.total ?? v.value ?? 0),
      }))
      .filter((v) => v.value > 0);
  }
  if (typeof value === 'object') {
    return Object.entries(value).map(([name, v]) => ({ name, value: Number(v) || 0 })).filter((v) => v.value > 0);
  }
  return [];
}

export function normalizeStats(raw = {}, shortCode = '') {
  const link = normalizeLink({ short_code: shortCode, ...raw, ...(raw.link || {}) });

  const events =
    firstArray(raw.click_history, raw.click_events, raw.clicks_data, raw.events, raw.visits, raw.recent_clicks, raw.clicks_list, raw.clicks) || [];

  const totalClicks = Number(
    raw.total_clicks ?? raw.click_count ?? (typeof raw.clicks === 'number' ? raw.clicks : undefined) ?? link.clicks ?? events.length
  ) || events.length;

  // ---- Daily series ----
  let counts = {};
  const dailyRaw = raw.daily_clicks ?? raw.clicks_by_day ?? raw.clicks_per_day ?? raw.clicks_by_date ?? raw.daily;
  if (Array.isArray(dailyRaw)) {
    dailyRaw.forEach((r) => {
      const d = parseDate(r.date ?? r.day ?? r.label);
      if (d) counts[dayKey(d)] = (counts[dayKey(d)] || 0) + Number(r.count ?? r.clicks ?? r.total ?? 0);
    });
  } else if (dailyRaw && typeof dailyRaw === 'object') {
    Object.entries(dailyRaw).forEach(([k, v]) => {
      const d = parseDate(k);
      if (d) counts[dayKey(d)] = (counts[dayKey(d)] || 0) + Number(v) || 0;
    });
  } else {
    events.forEach((e) => {
      const stamp = typeof e === 'string' ? e : EVENT_TIME_KEYS.map((k) => e?.[k]).find(Boolean);
      const d = parseDate(stamp);
      if (d) counts[dayKey(d)] = (counts[dayKey(d)] || 0) + 1;
    });
  }
  const daily = Object.keys(counts).length || totalClicks >= 0 ? fillDays(counts) : [];

  // ---- Breakdowns (only those the backend actually provides) ----
  const breakdowns = BREAKDOWNS.map(({ key, label }) => {
    let list = toBreakdownList(raw[`by_${key}`] ?? raw[`${key}s`] ?? raw[`clicks_by_${key}`] ?? raw[`${key}_breakdown`]);
    if (!list.length && events.length && typeof events[0] === 'object') {
      const tally = {};
      events.forEach((e) => {
        const v = e?.[key];
        if (v) tally[v] = (tally[v] || 0) + 1;
      });
      list = toBreakdownList(tally);
    }
    return { key, label, data: list.sort((a, b) => b.value - a.value).slice(0, 6) };
  }).filter((b) => b.data.length);

  // ---- Recent clicks ----
  const recent = events
    .map((e) => (typeof e === 'string' ? { time: e } : { ...e, time: EVENT_TIME_KEYS.map((k) => e?.[k]).find(Boolean) }))
    .filter((e) => parseDate(e.time))
    .sort((a, b) => parseDate(b.time) - parseDate(a.time))
    .slice(0, 8);

  return { link, totalClicks, daily, breakdowns, recent };
}
