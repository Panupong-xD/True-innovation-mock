"use client";

import { Check, CircleSlash, Pill, RotateCcw, Utensils, Dumbbell, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { updateTaskStatus } from "@/lib/services/mock-store";
import { formatThaiDate } from "@/lib/utils";

export default function PatientCarePlanPage() {
  const { db, setDb } = useMockStore();
  const patient = db.patients[0];
  const plan = db.carePlans.find((item) => item.patientId === patient.id)!;
  const sections = [
    ["ยา", plan.medication, Pill],
    ["อาหาร", plan.diet, Utensils],
    ["ออกกำลัง", plan.exercise, Dumbbell],
    ["การวัดค่า", plan.measurement, CalendarCheck]
  ] as const;

  return (
    <MobileShell role="patient" title="แผนดูแล">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>แผนดูแลที่แพทย์อนุมัติ</CardTitle>
            <p className="mt-1 text-sm text-slate-500">อัปเดต {formatThaiDate(plan.updatedAt)}</p>
          </div>
          <Badge tone={plan.status === "published" ? "green" : "yellow"}>{plan.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}</Badge>
        </CardHeader>
        <CardContent>
          <p className="rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap">{plan.summary}</p>
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

      <Card>
        <CardHeader><CardTitle>Checklist วันนี้</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {plan.tasks.map((task) => (
            <div key={task.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{task.time} · {task.detail}</p>
                </div>
                <Badge tone={task.status === "completed" ? "green" : task.status === "skipped" ? "orange" : task.status === "cannot" ? "red" : "blue"}>
                  {task.status === "completed" ? "Completed" : task.status === "skipped" ? "Skipped" : task.status === "cannot" ? "Cannot Complete" : "รอดำเนินการ"}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button size="sm" variant="success" onClick={() => setDb((current) => updateTaskStatus(current, plan.id, task.id, "completed"))}><Check className="h-4 w-4" /> ทำแล้ว</Button>
                <Button size="sm" variant="outline" onClick={() => setDb((current) => updateTaskStatus(current, plan.id, task.id, "skipped"))}><RotateCcw className="h-4 w-4" /> ข้าม</Button>
                <Button size="sm" variant="destructive" onClick={() => setDb((current) => updateTaskStatus(current, plan.id, task.id, "cannot"))}><CircleSlash className="h-4 w-4" /> ทำไม่ได้</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </MobileShell>
  );
}
