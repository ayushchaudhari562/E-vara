import { ShieldAlert } from "lucide-react";

interface ThreatLevelIndicatorProps {
  riskScore: number;
}

const getThreatLevel = (score: number) => {
  if (score >= 80) return { label: "DEFCON 2 - CRITICAL", color: "text-[hsl(var(--severity-high))]", glow: "shadow-[0_0_26px_hsl(var(--severity-high)/0.45)]" };
  if (score >= 60) return { label: "DEFCON 3 - HIGH", color: "text-[hsl(var(--severity-medium))]", glow: "shadow-[0_0_24px_hsl(var(--severity-medium)/0.38)]" };
  if (score >= 35) return { label: "DEFCON 4 - ELEVATED", color: "text-primary", glow: "shadow-[0_0_22px_hsl(var(--primary)/0.35)]" };
  return { label: "DEFCON 5 - GUARDED", color: "text-[hsl(var(--severity-low))]", glow: "shadow-[0_0_18px_hsl(var(--severity-low)/0.35)]" };
};

export const ThreatLevelIndicator = ({ riskScore }: ThreatLevelIndicatorProps) => {
  const level = getThreatLevel(riskScore);

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-card/70 p-4 backdrop-blur-md neon-panel">
      <div className="scan-line" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`h-5 w-5 ${level.color}`} />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Global Threat Level</p>
            <p className={`text-sm font-semibold ${level.color}`}>{level.label}</p>
          </div>
        </div>
        <div className={`rounded-lg border border-primary/40 bg-background/40 px-3 py-2 font-mono text-lg ${level.color} ${level.glow}`}>
          {riskScore}/100
        </div>
      </div>
    </div>
  );
};
