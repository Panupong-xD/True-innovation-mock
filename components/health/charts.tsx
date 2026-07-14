"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Heart, Activity, HeartPulse, Scale, Moon, Dumbbell, Ruler } from "lucide-react";
import { HealthRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

function chartData(records: HealthRecord[]) {
  return records.slice(-14).map((record) => {
    const height = record.height || 170;
    const heightM = height / 100;
    const bmi = record.weight / (heightM * heightM);
    return {
      date: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(record.date)),
      sys: record.systolic,
      dia: record.diastolic,
      ความดัน: record.systolic,
      น้ำตาล: record.bloodSugar,
      น้ำหนัก: record.weight,
      ส่วนสูง: height,
      ชีพจร: record.heartRate,
      นอน: record.sleepHours,
      ออกกำลัง: record.exerciseMinutes,
      ยา: record.medicationTaken ? 100 : 0,
      อาหาร: record.foodScore,
      bmi: Number(bmi.toFixed(1))
    };
  });
}

export function TrendChart({ records, type = "bp" }: { records: HealthRecord[]; type?: "bp" | "sugar" | "weight" | "sleep" }) {
  const data = chartData(records);
  const key = type === "sugar" ? "น้ำตาล" : type === "weight" ? "น้ำหนัก" : type === "sleep" ? "นอน" : "sys";
  const label = type === "sugar" ? "ระดับน้ำตาล" : type === "weight" ? "น้ำหนัก" : type === "sleep" ? "ชั่วโมงนอน" : "ความดันตัวบน";
  const color = type === "sugar" ? "#10b981" : type === "weight" ? "#0ea5e9" : type === "sleep" ? "#6366f1" : "#ef4444";

  return (
    <div className="h-60 w-full bg-white rounded-2xl p-4 border border-sky-100/80 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -24, right: 6, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip isAnimationActive={false} contentStyle={{ borderRadius: 16, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }} />
          <Area type="monotone" dataKey={key} name={label} stroke={color} strokeWidth={2.5} fill={`url(#gradient-${type})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MultiMetricChart({ records, mode = "all" }: { records: HealthRecord[]; mode?: "all" | "patient" }) {
  const [activeTab, setActiveTab] = useState<"bp" | "sugar" | "heart" | "weight" | "sleep" | "exercise" | "height">(() => {
    return mode === "patient" ? "weight" : "bp";
  });
  const data = chartData(records);

  // Dynamic clinical stats calculations
  const total = records.length;
  const avgSys = total ? Math.round(records.reduce((acc, r) => acc + r.systolic, 0) / total) : 0;
  const avgDia = total ? Math.round(records.reduce((acc, r) => acc + r.diastolic, 0) / total) : 0;
  const avgSugar = total ? Math.round(records.reduce((acc, r) => acc + r.bloodSugar, 0) / total) : 0;
  const adherence = total ? Math.round((records.filter(r => r.medicationTaken).length / total) * 100) : 0;
  const avgWeight = total ? Number((records.reduce((acc, r) => acc + r.weight, 0) / total).toFixed(1)) : 0;
  const avgHeight = total ? Number((records.reduce((acc, r) => acc + (r.height || 170), 0) / total).toFixed(1)) : 0;

  const menu = mode === "patient" ? [
    { id: "weight", label: "น้ำหนัก", icon: Scale, color: "text-sky-500" },
    { id: "height", label: "ส่วนสูง", icon: Ruler, color: "text-indigo-500" }
  ] as const : [
    { id: "bp", label: "ความดัน", icon: Heart, color: "text-rose-500" },
    { id: "sugar", label: "น้ำตาล", icon: Activity, color: "text-emerald-600" },
    { id: "heart", label: "ชีพจร", icon: HeartPulse, color: "text-rose-500" },
    { id: "weight", label: "น้ำหนัก", icon: Scale, color: "text-sky-500" },
    { id: "sleep", label: "การนอน", icon: Moon, color: "text-indigo-500" },
    { id: "exercise", label: "ออกกำลัง", icon: Dumbbell, color: "text-teal-600" }
  ] as const;

  // Active chart configurations in Light Mode theme
  const getChartConfig = () => {
    switch (activeTab) {
      case "sugar":
        return {
          title: "กราฟระดับน้ำตาลในเลือด (mg/dL)",
          key: "น้ำตาล",
          label: "น้ำตาลในเลือด",
          color: "#10b981",
          domain: ["dataMin - 15", "dataMax + 15"] as [string, string]
        };
      case "heart":
        return {
          title: "กราฟอัตราการเต้นของหัวใจ (ครั้ง/นาที)",
          key: "ชีพจร",
          label: "อัตราเต้นหัวใจ",
          color: "#f43f5e",
          domain: ["dataMin - 10", "dataMax + 10"] as [string, string]
        };
      case "weight":
        return {
          title: "กราฟแนวโน้มน้ำหนักตัว (กิโลกรัม)",
          key: "น้ำหนัก",
          label: "น้ำหนัก",
          color: "#0ea5e9",
          domain: ["dataMin - 3", "dataMax + 3"] as [string, string]
        };
      case "height":
        return {
          title: "กราฟแนวโน้มส่วนสูง (เซนติเมตร)",
          key: "ส่วนสูง",
          label: "ส่วนสูง",
          color: "#8b5cf6",
          domain: ["dataMin - 5", "dataMax + 5"] as [string, string]
        };
      case "sleep":
        return {
          title: "กราฟชั่วโมงการนอนหลับ (ชั่วโมง)",
          key: "นอน",
          label: "เวลานอนหลับ",
          color: "#6366f1",
          domain: [0, 12] as [number, number]
        };
      case "exercise":
        return {
          title: "กราฟเวลาการออกกำลังกาย (นาที)",
          key: "ออกกำลัง",
          label: "ออกกำลังกาย",
          color: "#14b8a6",
          domain: [0, "dataMax + 15"] as [number, string]
        };
      default:
        return {
          title: "กราฟระดับความดันโลหิต (มม.ปรอท)",
          key: "sys",
          label: "SYS (ตัวบน)",
          color: "#0ea5e9",
          domain: ["dataMin - 20", "dataMax + 20"] as [string, string]
        };
    }
  };

  const config = getChartConfig();

  return (
    <div className="w-full">
      {/* Dynamic Grid Buttons based on mode */}
      <div className={cn("grid gap-2.5 mb-4", mode === "patient" ? "grid-cols-2" : "grid-cols-3")}>
        {menu.map((m) => {
          const active = activeTab === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id as any)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 active:scale-95 select-none",
                active
                  ? "bg-sky-50/90 border-sky-500 text-sky-700 shadow-sm"
                  : "bg-white border-sky-100/70 text-slate-600 hover:border-sky-200 hover:bg-sky-50/30"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1.5", active ? "text-sky-600" : m.color)} />
              <span className="text-[11px] font-bold tracking-wide">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Chart Container Card (White Light Mode) */}
      <div className="bg-white border border-sky-100/70 rounded-3xl p-5 shadow-sm text-slate-800 flex flex-col justify-between">
        <div>
          {/* Header row inside chart */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold tracking-wide text-slate-850">
              {config.title}
            </h3>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ซิงค์กับแพทย์
            </span>
          </div>

          {/* Recharts Render Grid */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "bp" ? (
                // Double lines for Blood Pressure (SYS and DIA)
                <AreaChart data={data} margin={{ left: -26, right: 6, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradient-sys" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="gradient-dia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} domain={[60, 180]} ticks={[60, 90, 120, 150, 180]} />
                  <Tooltip isAnimationActive={false} contentStyle={{ borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }} />
                  <Area type="monotone" dataKey="sys" name="ความดันตัวบน (SYS)" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gradient-sys)" />
                  <Area type="monotone" dataKey="dia" name="ความดันตัวล่าง (DIA)" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradient-dia)" />
                </AreaChart>
              ) : (
                // Single line Area chart for other metrics
                <AreaChart data={data} margin={{ left: -26, right: 6, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradient-active" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} domain={config.domain as any} />
                  <Tooltip isAnimationActive={false} contentStyle={{ borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }} />
                  <Area type="monotone" dataKey={config.key!} name={config.label} stroke={config.color} strokeWidth={2.5} fill="url(#gradient-active)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Averages Row Footer (dynamic based on mode) */}
        {mode === "patient" ? (
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 mt-4 text-center">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">น้ำหนักเฉลี่ย</p>
              <p className="text-base font-extrabold text-slate-850">{avgWeight} กก.</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">ส่วนสูงเฉลี่ย</p>
              <p className="text-base font-extrabold text-slate-850">{avgHeight} ซม.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mt-4 text-center">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">ความดันเฉลี่ย</p>
              <p className="text-base font-extrabold text-slate-850">{avgSys}/{avgDia}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">น้ำตาลเฉลี่ย</p>
              <p className="text-base font-extrabold text-slate-850">{avgSugar} mg/dL</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">ทานยาสม่ำเสมอ</p>
              <p className="text-base font-extrabold text-emerald-600">{adherence}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DoctorChartsGrid({ records, className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" }: { records: HealthRecord[]; className?: string }) {
  const data = chartData(records);

  const configs = [
    {
      title: "ความดันโลหิต (mmHg)",
      type: "bp",
      color: "#0ea5e9",
      domain: [60, 180] as [number, number],
      ticks: [60, 90, 120, 150, 180]
    },
    {
      title: "ระดับน้ำตาล (mg/dL)",
      type: "sugar",
      key: "น้ำตาล",
      label: "น้ำตาลในเลือด",
      color: "#10b981",
      domain: ["dataMin - 15", "dataMax + 15"] as [string, string]
    },
    {
      title: "ชีพจร (ครั้ง/นาที)",
      type: "heart",
      key: "ชีพจร",
      label: "ชีพจร",
      color: "#f43f5e",
      domain: ["dataMin - 10", "dataMax + 10"] as [string, string]
    },
    {
      title: "น้ำหนัก (กก.)",
      type: "weight",
      key: "น้ำหนัก",
      label: "น้ำหนัก",
      color: "#0ea5e9",
      domain: ["dataMin - 3", "dataMax + 3"] as [string, string]
    },
    {
      title: "การนอน (ชั่วโมง)",
      type: "sleep",
      key: "นอน",
      label: "ชั่วโมงนอน",
      color: "#6366f1",
      domain: [0, 12] as [number, number]
    },
    {
      title: "ออกกำลังกาย (นาที)",
      type: "exercise",
      key: "ออกกำลัง",
      label: "ออกกำลัง",
      color: "#14b8a6",
      domain: [0, "dataMax + 15"] as [number, string]
    },
    {
      title: "ส่วนสูง (ซม.)",
      type: "height",
      key: "ส่วนสูง",
      label: "ส่วนสูง",
      color: "#8b5cf6",
      domain: ["dataMin - 5", "dataMax + 5"] as [string, string]
    },
    {
      title: "ดัชนีมวลกาย (BMI)",
      type: "bmi",
      key: "bmi",
      label: "BMI",
      color: "#f59e0b",
      domain: ["dataMin - 2", "dataMax + 2"] as [string, string]
    }
  ];

  return (
    <div className={className}>
      {configs.map((c) => {
        let avgText = "";
        const total = records.length;
        if (total > 0) {
          if (c.type === "bp") {
            const avgSys = Math.round(records.reduce((acc, r) => acc + r.systolic, 0) / total);
            const avgDia = Math.round(records.reduce((acc, r) => acc + r.diastolic, 0) / total);
            avgText = `${avgSys}/${avgDia} mmHg`;
          } else if (c.type === "sugar") {
            const avgVal = Math.round(records.reduce((acc, r) => acc + r.bloodSugar, 0) / total);
            avgText = `${avgVal} mg/dL`;
          } else if (c.type === "heart") {
            const avgVal = Math.round(records.reduce((acc, r) => acc + (r.heartRate || 72), 0) / total);
            avgText = `${avgVal} bpm`;
          } else if (c.type === "weight") {
            const avgVal = (records.reduce((acc, r) => acc + r.weight, 0) / total).toFixed(1);
            avgText = `${avgVal} กก.`;
          } else if (c.type === "sleep") {
            const avgVal = (records.reduce((acc, r) => acc + r.sleepHours, 0) / total).toFixed(1);
            avgText = `${avgVal} ชม.`;
          } else if (c.type === "exercise") {
            const avgVal = Math.round(records.reduce((acc, r) => acc + r.exerciseMinutes, 0) / total);
            avgText = `${avgVal} นาที`;
          } else if (c.type === "height") {
            const avgVal = (records.reduce((acc, r) => acc + (r.height || 170), 0) / total).toFixed(1);
            avgText = `${avgVal} ซม.`;
          } else if (c.type === "bmi") {
            const avgVal = (records.reduce((acc, r) => {
              const hM = (r.height || 170) / 100;
              return acc + (r.weight / (hM * hM));
            }, 0) / total).toFixed(1);
            avgText = `${avgVal}`;
          }
        }

        return (
          <div key={c.title} className="bg-white border border-sky-100/70 rounded-3xl p-3 sm:p-4 shadow-sm text-slate-800 flex flex-col justify-between h-[220px] sm:h-[280px]">
            <div>
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <h4 className="text-[10px] sm:text-xs font-bold tracking-wide text-slate-700 truncate">
                  {c.title}
                </h4>
              </div>
              <div className="h-[145px] sm:h-[195px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {c.type === "bp" ? (
                    <AreaChart data={data} margin={{ left: -22, right: -4, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grid-sys" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.01} />
                        </linearGradient>
                        <linearGradient id="grid-dia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#64748b" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 8, fill: "#64748b" }} tickLine={false} axisLine={false} domain={c.domain} ticks={c.ticks} width={25} />
                      <Tooltip isAnimationActive={false} contentStyle={{ borderRadius: 10, fontSize: 10, padding: 6 }} />
                      <Area type="monotone" dataKey="sys" name="SYS" stroke="#0ea5e9" strokeWidth={2} fill="url(#grid-sys)" />
                      <Area type="monotone" dataKey="dia" name="DIA" stroke="#3b82f6" strokeWidth={2} fill="url(#grid-dia)" />
                    </AreaChart>
                  ) : (
                    <AreaChart data={data} margin={{ left: -22, right: -4, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grid-${c.type}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={c.color} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={c.color} stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#64748b" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 8, fill: "#64748b" }} tickLine={false} axisLine={false} domain={c.domain as any} width={25} />
                      <Tooltip isAnimationActive={false} contentStyle={{ borderRadius: 10, fontSize: 10, padding: 6 }} />
                      <Area type="monotone" dataKey={c.key!} name={c.label} stroke={c.color} strokeWidth={2} fill={`url(#grid-${c.type})`} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-2 sm:pt-2.5 mt-1.5 sm:mt-2 flex justify-between items-center text-[10px] sm:text-[11px]">
              <span className="text-slate-500 font-semibold">ค่าเฉลี่ย:</span>
              <span className="font-extrabold text-slate-850 truncate">{avgText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdherenceChart({ records }: { records: HealthRecord[] }) {
  const data = chartData(records).slice(-7);
  return (
    <div className="h-56 w-full bg-white rounded-2xl p-4 border border-sky-100/80 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -24, right: 6, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip isAnimationActive={false} contentStyle={{ borderRadius: 16, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }} />
          <Bar dataKey="ยา" name="ทานยา (%)" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="ออกกำลัง" name="ออกกำลัง (นาที)" fill="#38bdf8" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
