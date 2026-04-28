import { useEffect, useMemo, useState } from "react";
import { Bell, ScanFace, Clock } from "lucide-react";

interface StatsCardsProps {
  alertCount: number;
  scanCount: number;
  monitoringActive: boolean;
  monitoringStartTime: Date | null;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const id = setInterval(() => {
      setDisplay((prev) => {
        if (prev === value) return prev;
        return prev + Math.sign(value - prev);
      });
    }, 24);

    return () => clearInterval(id);
  }, [value]);

  return <span>{display}</span>;
};

const Ring = ({ value, label, icon: Icon }: { value: number; label: string; icon: typeof Bell }) => {
  const dash = `${value} ${100 - value}`;
  return (
    <div className="neon-panel lift-3d rounded-lg border border-border/70 bg-card/70 p-3 backdrop-blur-md">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <svg className="h-11 w-11 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" />
        </svg>
        <p className="text-xl font-bold text-foreground tabular-nums"><AnimatedNumber value={value} /></p>
      </div>
    </div>
  );
};

const StatsCards = ({ alertCount, scanCount, monitoringActive, monitoringStartTime }: StatsCardsProps) => {
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    if (!monitoringActive || !monitoringStartTime) {
      setUptime("00:00:00");
      return;
    }
    const tick = () => {
      const diff = Math.floor((Date.now() - monitoringStartTime.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      setUptime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [monitoringActive, monitoringStartTime]);

  const alertRisk = useMemo(() => Math.min(96, 20 + alertCount * 10), [alertCount]);
  const scanCoverage = useMemo(() => Math.min(95, 30 + scanCount * 18), [scanCount]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Ring value={alertRisk} label="Alert Pressure" icon={Bell} />
      <Ring value={scanCoverage} label="Scan Coverage" icon={ScanFace} />
      <div className="neon-panel lift-3d rounded-lg border border-border/70 bg-card/70 p-3 backdrop-blur-md">
        <div className="mb-2 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">System Uptime</span>
        </div>
        <p className="text-xl font-bold tabular-nums text-foreground">{uptime}</p>
        <p className={`mt-1 text-[11px] ${monitoringActive ? "text-primary live-pulse" : "text-muted-foreground"}`}>
          {monitoringActive ? "Live monitoring" : "Monitoring idle"}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
