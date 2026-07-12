"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardList, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorShell } from "@/components/layouts/doctor-shell";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { publishCarePlan } from "@/lib/services/mock-store";
import { askAI } from "@/lib/services/ai/client";

export default function DoctorCarePlansPage() {
  const { db, setDb } = useMockStore();
  const [rewritingId, setRewritingId] = useState<string | null>(null);

  async function handleRewrite(plan: typeof db.carePlans[0]) {
    const patient = db.patients.find((item) => item.id === plan.patientId)!;
    setRewritingId(plan.id);
    try {
      const answer = await askAI(
        [
          "ตอบเป็นภาษาไทยในรูปแบบแผนดูแลที่บ้านสำหรับแพทย์ สรุปสั้นๆ 1 ย่อหน้า ไม่เกิน 3 ประโยค",
          `ผู้ป่วย: ${patient.name}`,
          `ข้อมูลวินิจฉัยโรค: ${patient.diagnosis.join(", ")}`,
          `ยาปัจจุบัน: ${patient.medications.join(", ")}`,
          `ร่างเดิมของแผนการดูแล: ${plan.summary}`
        ].join("\n")
      );
      
      setDb((current) => ({
        ...current,
        carePlans: current.carePlans.map((item) =>
          item.id === plan.id ? { ...item, summary: answer, status: "draft" as const } : item
        )
      }));
      toast.success(`ปรับปรุงแผนดูแลของ ${patient.name} เรียบร้อยแล้ว`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เรียก SWU AI ไม่สำเร็จ");
    } finally {
      setRewritingId(null);
    }
  }

  return (
    <DoctorShell title="Care Plans">
      <div className="grid gap-5 xl:grid-cols-2">
        {db.carePlans.slice(0, 8).map((plan) => {
          const patient = db.patients.find((item) => item.id === plan.patientId)!;
          const isRewriting = rewritingId === plan.id;
          return (
            <Card key={plan.id}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-sky-600" /> {patient.name}</CardTitle>
                  <p className="mt-1 text-sm text-slate-500 whitespace-pre-wrap">{plan.summary}</p>
                </div>
                <Badge tone={plan.status === "published" ? "green" : "yellow"}>{plan.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-sky-50 p-3 text-sm"><b>Medication</b><br />{plan.medication[0]}</div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-sm"><b>Diet</b><br />{plan.diet[0]}</div>
                  <div className="rounded-2xl bg-orange-50 p-3 text-sm"><b>Exercise</b><br />{plan.exercise[0]}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleRewrite(plan)} disabled={isRewriting}>
                    {isRewriting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Rewriting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Rewrite
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setDb((current) => publishCarePlan(current, plan))} disabled={isRewriting}>
                    <CheckCircle2 className="h-4 w-4" /> Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DoctorShell>
  );
}
