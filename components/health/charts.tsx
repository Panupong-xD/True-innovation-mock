"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HealthRecord } from "@/lib/types";

function chartData(records: HealthRecord[]) {
  return records.slice(-14).map((record) => ({
    date: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(record.date)),
    ความดัน: record.systolic,
    น้ำตาล: record.bloodSugar,
    น้ำหนัก: record.weight,
    ชีพจร: record.heartRate,
    นอน: record.sleepHours,
    ออกกำลัง: record.exerciseMinutes,
    ยา: record.medicationTaken ? 100 : 0,
    อาหาร: record.foodScore
  }));
}

export function TrendChart({ records, type = "bp" }: { records: HealthRecord[]; type?: "bp" | "sugar" | "weight" | "sleep" }) {
  const data = chartData(records);
  const key = type === "sugar" ? "น้ำตาล" : type === "weight" ? "น้ำหนัก" : type === "sleep" ? "นอน" : "ความดัน";
  const color = type === "sugar" ? "#f59e0b" : type === "weight" ? "#10b981" : type === "sleep" ? "#6366f1" : "#0ea5e9";
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #bae6fd" }} />
          <Area type="monotone" dataKey={key} stroke={color} strokeWidth={3} fill={`url(#gradient-${type})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MultiMetricChart({ records }: { records: HealthRecord[] }) {
  const data = chartData(records);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #bae6fd" }} />
          <Line type="monotone" dataKey="ความดัน" stroke="#0ea5e9" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="น้ำตาล" stroke="#f97316" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="ชีพจร" stroke="#ef4444" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdherenceChart({ records }: { records: HealthRecord[] }) {
  const data = chartData(records).slice(-7);
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #bae6fd" }} />
          <Bar dataKey="ยา" fill="#14b8a6" radius={[10, 10, 0, 0]} />
          <Bar dataKey="ออกกำลัง" fill="#38bdf8" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
