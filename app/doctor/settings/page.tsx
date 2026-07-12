"use client";

import { Cloud, Database, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorShell } from "@/components/layouts/doctor-shell";
import { SwuSettings } from "@/components/ui/swu-settings";

export default function DoctorSettingsPage() {
  const resources = ["Patient", "Observation", "Medication", "Condition", "Encounter", "CarePlan", "Consent"];
  return (
    <DoctorShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Cloud className="h-5 w-5 text-sky-600" /> TRUE IDC</CardTitle></CardHeader>
              <CardContent className="text-sm leading-6 text-slate-600">
                จำลองการเก็บข้อมูลบน TRUE IDC Health Cloud พร้อมแยกชั้น service สำหรับต่อ API จริงภายหลัง
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-sky-600" /> PDPA Consent</CardTitle></CardHeader>
              <CardContent className="text-sm leading-6 text-slate-600">
                ผู้ป่วยเป็นเจ้าของข้อมูลเสมอ ผู้ดูแลไม่สามารถอนุมัติคำขอแพทย์แทนผู้ป่วยได้
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-sky-600" /> HL7 FHIR Mock</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {resources.map((resource) => <span key={resource} className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">{resource}</span>)}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <SwuSettings />
        </div>
      </div>
    </DoctorShell>
  );
}
