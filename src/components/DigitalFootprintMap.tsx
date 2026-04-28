import { useMemo, useState } from "react";

interface Node {
  id: string;
  label: string;
  risk: number;
  x: number;
  y: number;
  detail: string;
}

const NODES: Node[] = [
  { id: "identity", label: "You", risk: 70, x: 50, y: 50, detail: "Primary identity anchor" },
  { id: "github", label: "GitHub", risk: 68, x: 22, y: 30, detail: "Public repos reveal email pattern history" },
  { id: "instagram", label: "Instagram", risk: 74, x: 78, y: 32, detail: "Profile discoverability high via handle reuse" },
  { id: "twitter", label: "Twitter", risk: 61, x: 80, y: 70, detail: "Frequent repost mentions increase exposure" },
  { id: "linkedin", label: "LinkedIn", risk: 55, x: 20, y: 72, detail: "Professional metadata correlates with other profiles" },
];

const edgeWidth = (risk: number) => Math.max(1.5, Math.min(5, risk / 20));

const riskColor = (risk: number) => {
  if (risk >= 70) return "hsl(var(--severity-high))";
  if (risk >= 55) return "hsl(var(--severity-medium))";
  return "hsl(var(--severity-low))";
};

export const DigitalFootprintMap = () => {
  const [activeNode, setActiveNode] = useState<string>("identity");

  const active = useMemo(() => NODES.find((n) => n.id === activeNode) || NODES[0], [activeNode]);
  const center = NODES[0];

  return (
    <section className="neon-panel rounded-xl border border-border/80 bg-card/70 p-5 backdrop-blur-md">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">Digital Footprint Map</h3>
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="relative min-h-[260px] rounded-lg border border-border/60 bg-background/40">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {NODES.slice(1).map((node) => (
              <line
                key={node.id}
                x1={center.x}
                y1={center.y}
                x2={node.x}
                y2={node.y}
                stroke={riskColor(node.risk)}
                strokeWidth={edgeWidth(node.risk)}
                opacity={0.7}
              />
            ))}
          </svg>
          {NODES.map((node) => {
            const isActive = node.id === activeNode;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNode(node.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[11px] font-mono transition-all ${isActive ? "scale-110 shadow-[0_0_20px_hsl(var(--primary)/0.55)]" : "opacity-85 hover:opacity-100"}`}
                style={{
                  top: `${node.y}%`,
                  left: `${node.x}%`,
                  borderColor: riskColor(node.risk),
                  color: riskColor(node.risk),
                  background: "hsl(var(--card)/0.65)",
                }}
              >
                {node.label}
              </button>
            );
          })}
        </div>
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Selected Node</p>
          <p className="mt-1 text-base font-semibold text-foreground">{active.label}</p>
          <p className="mt-2 text-xs text-muted-foreground">{active.detail}</p>
          <div className="mt-4">
            <p className="text-[10px] uppercase text-muted-foreground">Risk Intensity</p>
            <div className="mt-1 h-2 rounded-full bg-background/70">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${active.risk}%`, background: riskColor(active.risk), boxShadow: `0 0 16px ${riskColor(active.risk)}` }}
              />
            </div>
            <p className="mt-1 text-xs font-mono text-foreground">{active.risk}/100</p>
          </div>
        </div>
      </div>
    </section>
  );
};
