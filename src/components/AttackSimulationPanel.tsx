import { useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

const STEPS = [
  { label: "Email harvested from old data broker listing", risk: "high" },
  { label: "Same email resolves to public GitHub profile", risk: "high" },
  { label: "GitHub bio reveals Instagram alias", risk: "medium" },
  { label: "Instagram metadata links to exposed contact trail", risk: "high" },
  { label: "Attacker builds composite dossier for targeting", risk: "high" },
] as const;

export const AttackSimulationPanel = () => {
  const [index, setIndex] = useState(-1);

  const running = index >= 0 && index < STEPS.length - 1;
  const done = index === STEPS.length - 1;

  const progress = useMemo(() => ((index + 1) / STEPS.length) * 100, [index]);

  const runSimulation = () => {
    setIndex(0);
    const timer = setInterval(() => {
      setIndex((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  return (
    <section className="neon-panel rounded-xl border border-border/80 bg-card/70 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">Attack Simulation Mode</h3>
        <div className="flex gap-2">
          <button onClick={runSimulation} className="neon-button inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            <Play className="h-3.5 w-3.5" /> Simulate Attack
          </button>
          <button onClick={() => setIndex(-1)} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="mb-4 h-2 rounded-full bg-background/70">
        <div className="h-2 rounded-full bg-gradient-to-r from-primary via-purple-400 to-[hsl(var(--severity-high))] transition-all duration-700" style={{ width: `${Math.max(0, progress)}%` }} />
      </div>

      <div className="space-y-2">
        {STEPS.map((step, stepIndex) => {
          const isActive = stepIndex <= index;
          const isWeakPoint = step.risk === "high";
          return (
            <div
              key={step.label}
              className={`rounded-md border p-2 text-xs transition-all ${isActive ? "translate-x-0 opacity-100" : "translate-x-2 opacity-35"} ${isWeakPoint ? "border-[hsl(var(--severity-high)/0.4)]" : "border-border/70"}`}
              style={{
                background: isActive
                  ? isWeakPoint
                    ? "hsl(var(--severity-high)/0.12)"
                    : "hsl(var(--primary)/0.1)"
                  : "hsl(var(--secondary)/0.2)",
              }}
            >
              {stepIndex + 1}. {step.label}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="mt-4 rounded-lg border border-[hsl(var(--severity-high)/0.35)] bg-[hsl(var(--severity-high)/0.12)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--severity-high))]">Risk Summary</p>
          <p className="mt-1 text-xs text-muted-foreground">Primary weak point detected: reused email across public GitHub and social profiles enables rapid identity pivoting.</p>
        </div>
      )}

      {running && <p className="mt-3 text-[11px] text-primary animate-pulse">Simulated attacker path in progress...</p>}
    </section>
  );
};
