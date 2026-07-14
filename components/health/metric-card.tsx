import { Info, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/types";

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  note,
  riskLevel,
  onInfoClick
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  note?: string;
  riskLevel?: RiskLevel;
  onInfoClick?: () => void;
}) {
  const textValClass = {
    green: "text-slate-950",
    yellow: "text-amber-600",
    orange: "text-orange-600",
    red: "text-red-600"
  }[riskLevel || "green"];

  return (
    <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white transition-all duration-300">
      <CardContent className="flex items-center gap-3 p-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <Icon className="h-5.5 w-5.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">{title}</p>
            {onInfoClick ? (
              <button
                onClick={onInfoClick}
                className="p-1 text-slate-400 hover:text-sky-600 rounded-full hover:bg-slate-100/50 transition-colors shrink-0"
                aria-label={`ข้อมูลแนะนำสำหรับ ${title}`}
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          <div className="flex items-end gap-0.5 mt-0.5">
            <span className={cn("text-xl font-extrabold leading-none tracking-tight", textValClass)}>{value}</span>
            {unit ? <span className="text-[10px] font-bold text-slate-400 uppercase leading-none pb-0.5 pl-0.5">{unit}</span> : null}
          </div>
          {note ? <p className="mt-1 text-[10px] text-slate-400">{note}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const label = {
    green: "ปกติ",
    yellow: "เฝ้าดู",
    orange: "เสี่ยงปานกลาง",
    red: "เสี่ยงสูง"
  }[level];
  return <Badge tone={level}>{label}</Badge>;
}
