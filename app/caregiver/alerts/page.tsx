"use client";

import { BellRing, CalendarClock, Dumbbell, Mic, Pill } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { EarlyWarningCard } from "@/components/health/early-warning-card";
import { useMockStore } from "@/lib/hooks/use-mock-store";

export default function CaregiverAlertsPage() {
  const { db } = useMockStore();
  const patient = db.patients[0];
  const warning = db.earlyWarnings.find((item) => item.patientId === patient.id)!;
  const reminders = [
    [Pill, "Medication Reminder", "เตือนรับประทานยาเช้า"],
    [Dumbbell, "Exercise Reminder", "เดินเร็วช่วงเย็น"],
    [BellRing, "Measurement Reminder", "วัดความดันก่อนนอน"],
    [CalendarClock, "Appointment Reminder", "เตรียมเอกสารก่อนวันนัด"],
    [Mic, "Voice Reminder (Mock)", "ส่งเสียงเตือนด้วยข้อความเสียง"]
  ] as const;

  return (
    <MobileShell role="caregiver" title="แจ้งเตือน">
      <EarlyWarningCard warning={warning} />
      <Card>
        <CardHeader><CardTitle>ส่ง Reminder</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reminders.map(([Icon, title, detail]) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl bg-sky-50 p-3">
              <Icon className="h-5 w-5 text-sky-600" />
              <div className="flex-1">
                <p className="font-bold">{title}</p>
                <p className="text-sm text-slate-500">{detail}</p>
              </div>
              <Button size="sm" onClick={() => toast.success("ส่ง Push Notification (Mock) แล้ว")}>ส่ง</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </MobileShell>
  );
}
