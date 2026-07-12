"use client";

import { AlertTriangle, CalendarDays, ClipboardCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoctorShell } from "@/components/layouts/doctor-shell";
import { MetricCard } from "@/components/health/metric-card";
import { AdherenceChart, MultiMetricChart } from "@/components/health/charts";
import { EarlyWarningCard } from "@/components/health/early-warning-card";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { formatThaiDate } from "@/lib/utils";

export default function DoctorDashboardPage() {
  const { db } = useMockStore();
  const highRisk = db.earlyWarnings.filter((item) => item.level === "red" || item.level === "orange");
  const pending = db.consents.filter((item) => item.status === "waiting");
  const patient = db.patients[0];
  const records = db.healthRecords.filter((item) => item.patientId === patient.id);
  const warning = db.earlyWarnings.find((item) => item.patientId === patient.id)!;

  return (
    <DoctorShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Patients" value={db.patients.length} icon={Users} tone="blue" />
        <MetricCard title="High Risk Patients" value={highRisk.length} icon={AlertTriangle} tone="red" />
        <MetricCard title="Pending Consent" value={pending.length} icon={ClipboardCheck} tone="yellow" />
        <MetricCard title="Today's Appointments" value={7} icon={CalendarDays} tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Card>
          <CardHeader><CardTitle>Early Warning Overview</CardTitle></CardHeader>
          <CardContent><MultiMetricChart records={records} /></CardContent>
        </Card>
        <EarlyWarningCard warning={warning} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>AI Risk Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {highRisk.slice(0, 5).map((warningItem) => {
              const itemPatient = db.patients.find((item) => item.id === warningItem.patientId)!;
              return (
                <div key={warningItem.id} className="flex items-center justify-between rounded-2xl bg-sky-50 p-4">
                  <div>
                    <p className="font-bold">{itemPatient.name}</p>
                    <p className="text-sm text-slate-500">{warningItem.reason}</p>
                  </div>
                  <Badge tone={warningItem.level}>{warningItem.score}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {db.notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border bg-white p-4">
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-slate-500">{item.message}</p>
                <p className="mt-2 text-xs font-semibold text-sky-700">{formatThaiDate(item.date)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Medication Adherence / Exercise</CardTitle></CardHeader>
        <CardContent><AdherenceChart records={records} /></CardContent>
      </Card>
    </DoctorShell>
  );
}
