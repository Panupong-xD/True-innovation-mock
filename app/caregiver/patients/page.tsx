"use client";

import { Activity, Check, HeartPulse, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { AdherenceChart, MultiMetricChart, TrendChart } from "@/components/health/charts";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { updateRecordStatus } from "@/lib/services/mock-store";
import { formatThaiDate } from "@/lib/utils";

export default function CaregiverPatientPage() {
  const { db, setDb } = useMockStore();
  const caregiver = db.caregivers[0];
  const patient = db.patients.find((item) => item.id === caregiver.patientId)!;
  const records = db.healthRecords.filter((item) => item.patientId === patient.id);
  const pending = records.filter((item) => item.confirmationStatus === "pending").slice(-6).reverse();

  return (
    <MobileShell role="caregiver" title="ผู้ป่วย">
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <HeartPulse className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{patient.name}</h2>
            <p className="text-sm text-slate-500">{patient.diagnosis.join(" · ")}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="monitoring">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="confirm">ยืนยัน</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="monitoring" className="space-y-4">
          <Card><CardHeader><CardTitle>Patient Health Summary</CardTitle></CardHeader><CardContent><MultiMetricChart records={records} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Sleep / Exercise / Food</CardTitle></CardHeader><CardContent><AdherenceChart records={records} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Weight Trend</CardTitle></CardHeader><CardContent><TrendChart records={records} type="weight" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="confirm" className="space-y-3">
          {pending.map((record) => (
            <Card key={record.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">BP {record.systolic}/{record.diastolic} · น้ำตาล {record.bloodSugar}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatThaiDate(record.date)} · บันทึกโดยผู้ป่วย</p>
                  </div>
                  <Badge tone="yellow">Pending Confirmation</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="success" onClick={() => setDb((current) => updateRecordStatus(current, record.id, "confirmed"))}><Check className="h-4 w-4" /> Confirmed</Button>
                  <Button variant="outline" onClick={() => setDb((current) => updateRecordStatus(current, record.id, "rejected"))}><X className="h-4 w-4" /> Rejected</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!pending.length ? <Card><CardContent className="p-5 text-center text-sm text-slate-500">ไม่มีรายการรอยืนยัน</CardContent></Card> : null}
        </TabsContent>
        <TabsContent value="timeline" className="space-y-3">
          {records.slice(-10).reverse().map((record) => (
            <div key={record.id} className="flex gap-3 rounded-2xl bg-white p-4 shadow-card">
              <Activity className="mt-1 h-5 w-5 text-sky-600" />
              <div>
                <p className="font-bold">{formatThaiDate(record.date)}</p>
                <p className="text-sm text-slate-500">BP {record.systolic}/{record.diastolic}, น้ำตาล {record.bloodSugar}, ยา {record.medicationTaken ? "ครบ" : "ขาด"}</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </MobileShell>
  );
}
