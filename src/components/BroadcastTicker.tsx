interface TickerItem {
  icon: React.ReactNode;
  text: string;
}

export default function BroadcastTicker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;
  const looped = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-line bg-black">
      <div className="absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-black to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-black to-transparent" />
      <div className="flex whitespace-nowrap py-2.5">
        <div className="ticker-track flex shrink-0 gap-10">
          {looped.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-text-muted"
            >
              <span className="text-red">{item.icon}</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}