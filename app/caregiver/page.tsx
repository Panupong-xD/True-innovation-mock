"use client";

import Link from "next/link";
import { BellRing, CheckCircle2, HeartPulse, Pill, Send, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { MetricCard } from "@/components/health/metric-card";
import { EarlyWarningCard } from "@/components/health/early-warning-card";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { HospitalCampaignCarousel } from "@/components/health/hospital-carousel";

export default function CaregiverHomePage() {
  const { db } = useMockStore();
  const caregiver = db.caregivers[0];
  const patient = db.patients.find((item) => item.id === caregiver.patientId)!;
  const records = db.healthRecords.filter((item) => item.patientId === patient.id);
  const latest = records[records.length - 1];
  const plan = db.carePlans.find((item) => item.patientId === patient.id)!;
  const warning = db.earlyWarnings.find((item) => item.patientId === patient.id)!;
  const pending = records.filter((item) => item.confirmationStatus === "pending").slice(-3);

  return (
    <MobileShell role="caregiver" title="หน้าหลักผู้ดูแล">
      <Card className="bg-gradient-to-br from-sky-500 to-teal-400 text-white">
        <CardContent className="p-5">
          <p className="text-sm font-semibold opacity-90">ดูแลผู้ป่วย 1 คน</p>
          <h2 className="mt-1 text-2xl font-bold">{patient.name}</h2>
          <p className="mt-2 text-sm opacity-90">{patient.diagnosis.join(" · ")}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="ความดัน" value={`${latest.systolic}/${latest.diastolic}`} icon={HeartPulse} tone="blue" />
        <MetricCard title="งานวันนี้" value={plan.tasks.length} unit="รายการ" icon={CheckCircle2} tone="green" />
      </div>

      <Card>
        <CardHeader><CardTitle>งานดูแลวันนี้</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {plan.tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-sky-50 p-3">
              <Pill className="h-5 w-5 text-sky-600" />
              <div className="flex-1">
                <p className="font-bold">{task.title}</p>
                <p className="text-xs text-slate-500">{task.time} · {task.detail}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success("ส่ง reminder แล้ว")}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>รอยืนยันข้อมูล</CardTitle>
          <Button size="sm" asChild><Link href="/caregiver/patients">ตรวจสอบ</Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {pending.length ? pending.map((record) => (
            <div key={record.id} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              BP {record.systolic}/{record.diastolic} · น้ำตาล {record.bloodSugar}
            </div>
          )) : <p className="text-sm text-slate-500">ไม่มีข้อมูลค้างยืนยัน</p>}
        </CardContent>
      </Card>

      <EarlyWarningCard warning={warning} />

      <HospitalCampaignCarousel />
    </MobileShell>
  );
}
