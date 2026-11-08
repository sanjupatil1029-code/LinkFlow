export default function StatCard({ icon: Icon, label, value, sub, loading = false }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-blush/70">{label}</p>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-grape to-plum text-amber">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-white/10" />
      ) : (
        <p className="mt-2 truncate text-3xl font-extrabold tracking-tight text-white">{value}</p>
      )}
      {sub && !loading && <p className="mt-1 truncate text-xs text-blush/60">{sub}</p>}
    </div>
  );
}
