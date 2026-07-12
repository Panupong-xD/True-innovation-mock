import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/types";

const toneClass: Record<RiskLevel | "blue", string> = {
  green: "bg-emerald-50 text-emerald-700",
  yellow: "bg-amber-50 text-amber-700",
  orange: "bg-orange-50 text-orange-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-sky-50 text-sky-700"
};

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  tone = "blue",
  note
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  tone?: RiskLevel | "blue";
  note?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", toneClass[tone])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <div className="flex flex-wrap items-end gap-1">
            <span className="text-2xl font-bold text-slate-950">{value}</span>
            {unit ? <span className="pb-1 text-xs font-semibold text-slate-500">{unit}</span> : null}
          </div>
          {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
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
