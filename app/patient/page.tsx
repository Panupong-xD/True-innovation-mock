"use client";

import Link from "next/link";
import { Activity, CalendarClock, Droplets, HeartPulse, Pill, Scale, ShieldCheck, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { MetricCard, RiskBadge } from "@/components/health/metric-card";
import { EarlyWarningCard } from "@/components/health/early-warning-card";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { formatThaiDate } from "@/lib/utils";

export default function PatientHomePage() {
  const { db } = useMockStore();
  const patient = db.patients[0];
  const records = db.healthRecords.filter((record) => record.patientId === patient.id);
  const latest = records[records.length - 1];
  const plan = db.carePlans.find((item) => item.patientId === patient.id)!;
  const warning = db.earlyWarnings.find((item) => item.patientId === patient.id)!;
  const notification = db.notifications.find((item) => item.userRole === "patient");
  const completed = plan.tasks.filter((task) => task.status === "completed").length;

  return (
    <MobileShell role="patient" title="หน้าหลักผู้ป่วย">
      <section className="rounded-[2rem] bg-gradient-to-br from-sky-500 to-teal-400 p-5 text-white shadow-soft">
        <p className="text-sm font-semibold opacity-90">สวัสดี {patient.name}</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm opacity-85">Health Score</p>
            <p className="text-5xl font-bold">{patient.healthScore}</p>
          </div>
          <div className="rounded-2xl bg-white/18 px-3 py-2 text-sm font-semibold backdrop-blur">
            {formatThaiDate(new Date())}
          </div>
        </div>
        <Progress className="mt-5 bg-white/25" value={patient.healthScore} />
      </section>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="ความดันล่าสุด" value={`${latest.systolic}/${latest.diastolic}`} unit="mmHg" icon={HeartPulse} tone="blue" />
        <MetricCard title="น้ำตาลล่าสุด" value={latest.bloodSugar} unit="mg/dL" icon={Droplets} tone="yellow" />
        <MetricCard title="น้ำหนัก" value={latest.weight} unit="kg" icon={Scale} tone="green" />
        <MetricCard title="ชีพจร" value={latest.heartRate} unit="bpm" icon={Activity} tone="red" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>งานวันนี้</CardTitle>
          <span className="text-sm font-semibold text-sky-700">
            {completed}/{plan.tasks.length}
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-sky-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700">
                {task.category === "medication" ? <Pill className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-500">{task.time} · {task.detail}</p>
              </div>
            </div>
          ))}
          <Button className="w-full" asChild>
            <Link href="/patient/care-plan">เปิดแผนดูแล</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>นัดหมายถัดไป</CardTitle>
          <CalendarClock className="h-5 w-5 text-sky-600" />
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold">พบแพทย์ติดตามผล</p>
          <p className="mt-1 text-sm text-slate-500">16 ก.ค. 2569 · 09:30 · {patient.hospital}</p>
        </CardContent>
      </Card>

      <EarlyWarningCard warning={warning} />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Quick Actions</CardTitle>
          <RiskBadge level={warning.level} />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button variant="secondary" asChild>
            <Link href="/patient/health"><HeartPulse className="h-4 w-4" /> บันทึกค่า</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/patient/health"><Utensils className="h-4 w-4" /> Food Scanner</Link>
          </Button>
        </CardContent>
      </Card>

      {notification ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-bold text-slate-900">{notification.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{notification.message}</p>
          </CardContent>
        </Card>
      ) : null}
    </MobileShell>
  );
}
