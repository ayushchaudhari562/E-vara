interface AIInsightPanelProps {
  alertCount: number;
  monitoringActive: boolean;
}

const MetricRing = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const dash = `${value} ${100 - value}`;

  return (
    <div className="rounded-lg border border-border/70 bg-secondary/25 p-3 text-center">
      <svg className="mx-auto h-16 w-16 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <p className="-mt-10 text-sm font-bold text-foreground">{value}</p>
      <p className="mt-4 text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
};

export const AIInsightPanel = ({ alertCount, monitoringActive }: AIInsightPanelProps) => {
  const breach = Math.min(95, 35 + alertCount * 9);
  const exposure = Math.min(90, 40 + alertCount * 7);
  const anomaly = monitoringActive ? Math.min(88, 30 + alertCount * 6) : 22;
  const score = Math.round((breach * 0.4 + exposure * 0.35 + anomaly * 0.25));

  const heatmap = [breach, exposure, anomaly, Math.min(95, score + 8), Math.max(18, score - 12)];

  return (
    <section className="neon-panel rounded-xl border border-border/80 bg-card/70 p-5 backdrop-blur-md">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">AI Insight Panel</h3>
      <p className="mt-2 text-xs text-muted-foreground">High exposure across 4 linked platforms. Primary vulnerability: reused email and discoverable username patterns.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricRing label="Breach Data" value={breach} color="hsl(var(--severity-high))" />
        <MetricRing label="Platform Exposure" value={exposure} color="hsl(var(--severity-medium))" />
        <MetricRing label="Activity Anomalies" value={anomaly} color="hsl(var(--primary))" />
      </div>

      <div className="mt-4 rounded-lg border border-primary/25 bg-background/40 p-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">E-Vara Risk Score</p>
        <p className="text-2xl font-bold text-primary">{score}/100</p>
        <div className="mt-2 flex gap-1">
          {heatmap.map((value, idx) => (
            <div
              key={`${value}-${idx}`}
              className="h-3 flex-1 rounded-sm"
              style={{ background: value > 70 ? "hsl(var(--severity-high))" : value > 45 ? "hsl(var(--severity-medium))" : "hsl(var(--severity-low))", opacity: 0.35 + value / 150 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
