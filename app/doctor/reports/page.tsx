"use client";

import { FileBarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorShell } from "@/components/layouts/doctor-shell";
import { AdherenceChart, MultiMetricChart, TrendChart } from "@/components/health/charts";
import { useMockStore } from "@/lib/hooks/use-mock-store";

export default function DoctorReportsPage() {
  const { db } = useMockStore();
  const patient = db.patients[0];
  const records = db.healthRecords.filter((item) => item.patientId === patient.id);
  const warning = db.earlyWarnings.find((item) => item.patientId === patient.id)!;
  return (
    <DoctorShell title="Reports">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileBarChart className="h-5 w-5 text-sky-600" /> รายงานก่อนนัดหมาย: {patient.name}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-sky-50 p-4"><p className="font-bold">Health Summary</p><p className="text-sm text-slate-500">BP และน้ำตาลเพิ่มเล็กน้อยใน 3 วัน</p></div>
          <div className="rounded-2xl bg-orange-50 p-4"><p className="font-bold">Risk</p><p className="text-sm text-slate-500">{warning.score}/100 · {warning.reason}</p></div>
          <div className="rounded-2xl bg-emerald-50 p-4"><p className="font-bold">Recommendation</p><p className="text-sm text-slate-500">{warning.doctorRecommendation}</p></div>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Trend</CardTitle></CardHeader><CardContent><MultiMetricChart records={records} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Medication Adherence / Exercise</CardTitle></CardHeader><CardContent><AdherenceChart records={records} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Nutrition</CardTitle></CardHeader><CardContent><TrendChart records={records} type="sugar" /></CardContent></Card>
        <Card><CardHeader><CardTitle>Timeline</CardTitle></CardHeader><CardContent><TrendChart records={records} type="weight" /></CardContent></Card>
      </div>
    </DoctorShell>
  );
}
