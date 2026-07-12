"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { MockChat } from "@/components/chat/mock-chat";
import { useMockStore } from "@/lib/hooks/use-mock-store";

export default function CaregiverAiPage() {
  const { db } = useMockStore();
  const caregiver = db.caregivers[0];
  const patient = db.patients.find((item) => item.id === caregiver.patientId)!;
  const records = db.healthRecords.filter((item) => item.patientId === patient.id);
  const latest = records[records.length - 1];
  const plan = db.carePlans.find((item) => item.patientId === patient.id)!;
  return (
    <MobileShell role="caregiver" title="ผู้ช่วย AI">
      <MockChat
        title="Caregiver AI Assistant"
        seedMessages={db.chatHistory.caregiver}
        mode="caregiver"
        context={`ผู้ดูแล ${caregiver.name}; ดูแล ${patient.name}; diagnosis ${patient.diagnosis.join(", ")}; care plan ${plan.summary}; BP ล่าสุด ${latest.systolic}/${latest.diastolic}; blood sugar ${latest.bloodSugar}; MCSI ${caregiver.mcsiScore}`}
      />
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold">Burnout Support</p>
            <p className="text-sm text-slate-500">ประเมิน MCSI และวางแผนพักใจ</p>
          </div>
          <Button size="sm" asChild><Link href="/caregiver/burnout">เปิด</Link></Button>
        </CardContent>
      </Card>
    </MobileShell>
  );
}
