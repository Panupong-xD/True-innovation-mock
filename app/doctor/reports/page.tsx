"use client";

import { useState } from "react";
import { FileBarChart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorShell } from "@/components/layouts/doctor-shell";
import { AdherenceChart, MultiMetricChart, TrendChart } from "@/components/health/charts";
import { useMockStore } from "@/lib/hooks/use-mock-store";

export default function DoctorReportsPage() {
  const { db } = useMockStore();
  const [selectedPatientId, setSelectedPatientId] = useState(db.patients[0]?.id || "");

  const currentPatient = db.patients.find((p) => p.id === selectedPatientId) || db.patients[0];
  const records = db.healthRecords.filter((item) => item.patientId === currentPatient.id);
  const warning = db.earlyWarnings.find((item) => item.patientId === currentPatient.id) || {
    score: 0,
    reason: "ไม่พบข้อมูลความเสี่ยงในระบบ",
    doctorRecommendation: "ไม่มีคำแนะนำด่วนสำหรับโรคเบาหวานและความดันโลหิตสูง"
  };

  return (
    <DoctorShell title="Reports">
      {/* Patient Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800">รายงานสุขภาพเชิงวิเคราะห์และการเปรียบเทียบ</h3>
          <p className="text-xs text-slate-500">เลือกดูรายงานผลตรวจและสถิติข้อมูลตามรายบุคคลด้านล่าง</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-sky-600" />
          <label className="text-sm font-semibold text-slate-600 shrink-0">รายชื่อผู้ป่วย:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="rounded-2xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:border-sky-300 focus:outline-none"
          >
            {db.patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border border-sky-50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <FileBarChart className="h-5 w-5 text-sky-600" /> 
            รายงานก่อนนัดหมาย: {currentPatient.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-sky-50 p-4 leading-6">
            <p className="font-bold text-sky-850">Health Summary</p>
            <p className="text-sm text-slate-600 mt-1">ความดันโลหิตและระดับน้ำตาลในช่วง 14 วันที่ผ่านมา</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-4 leading-6">
            <p className="font-bold text-orange-850">Risk Status</p>
            <p className="text-sm text-slate-600 mt-1">คะแนนความเสี่ยง {warning.score}/100 · {warning.reason}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 leading-6">
            <p className="font-bold text-emerald-850">AI Recommendation</p>
            <p className="text-sm text-slate-600 mt-1">{warning.doctorRecommendation}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <MultiMetricChart records={records} />
      </div>
    </DoctorShell>
  );
}
