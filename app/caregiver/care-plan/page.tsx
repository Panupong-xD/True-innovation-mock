"use client";

import { Check, CircleSlash, Pill, RotateCcw, Utensils, Dumbbell, CalendarCheck, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { confirmTaskStatus } from "@/lib/services/mock-store";
import { formatThaiDate } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

export default function CaregiverCarePlanPage() {
  const { db, setDb } = useMockStore();
  
  const caregiver = db.caregivers[0];
  const patient = db.patients.find((item) => item.id === caregiver.patientId)!;
  const plan = db.carePlans.find((item) => item.patientId === patient.id)!;
  const sections = [
    ["ยา", plan.medication, Pill],
    ["อาหาร", plan.diet, Utensils],
    ["ออกกำลัง", plan.exercise, Dumbbell],
    ["การวัดค่า", plan.measurement, CalendarCheck]
  ] as const;

  const dailyTasks = plan.tasks;

  return (
    <MobileShell role="caregiver" title="แผนดูแลผู้ป่วย">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>แผนรักษาของ {patient.name}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">อัปเดต {formatThaiDate(plan.updatedAt)}</p>
          </div>
          <Badge tone={plan.status === "published" ? "green" : "yellow"}>
            {plan.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-slate-700">
            <MarkdownRenderer content={plan.summary} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(([title, items, Icon]) => (
          <Card key={title}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5 text-sky-600" /> {title}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div key={item} className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-medium text-slate-700">{item}</div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily checklist verification log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            ตรวจสอบแผนงานคนไข้วันนี้
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyTasks.map((task) => (
            <div key={task.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{task.time} · {task.detail}</p>
                </div>
                <div>
                  {task.pendingConfirm ? (
                    <Badge tone="yellow">
                      🕒 รอคุณยืนยัน ({task.pendingConfirm === "completed" ? "ทำแล้ว" : task.pendingConfirm === "skipped" ? "ข้าม" : "ทำไม่ได้"})
                    </Badge>
                  ) : (
                    <Badge tone={task.status === "completed" ? "green" : task.status === "skipped" ? "orange" : task.status === "cannot" ? "red" : "blue"}>
                      {task.status === "completed" ? "ยืนยันแล้ว: ทำแล้ว" : task.status === "skipped" ? "ยืนยันแล้ว: ข้าม" : task.status === "cannot" ? "ยืนยันแล้ว: ทำไม่ได้" : "รอดำเนินการ"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Verification Buttons */}
              {task.pendingConfirm ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="success" 
                    onClick={() => setDb((current) => confirmTaskStatus(current, plan.id, task.id, true))}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4" /> อนุมัติบันทึก
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => setDb((current) => confirmTaskStatus(current, plan.id, task.id, false))}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <X className="h-4 w-4" /> ปฏิเสธ
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </MobileShell>
  );
}
