"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, HeartPulse, Pill, Send, Droplets, Scale, Activity, Info, Target } from "lucide-react";
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

  const [activeTip, setActiveTip] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // Dynamic calculations
  const height = latest.height || patient.height || 170;
  const bmiVal = parseFloat((latest.weight / Math.pow(height / 100, 2)).toFixed(1));

  // Risk evaluations
  const bpRisk: "green" | "yellow" | "orange" | "red" = 
    latest.systolic >= 140 || latest.diastolic >= 90 ? "red" :
    latest.systolic >= 120 || latest.diastolic >= 80 ? "yellow" : "green";

  const bsRisk: "green" | "yellow" | "orange" | "red" =
    latest.bloodSugar >= 126 ? "red" :
    latest.bloodSugar >= 100 ? "yellow" : "green";

  const bmiRisk: "green" | "yellow" | "orange" | "red" =
    bmiVal >= 25 ? "red" :
    bmiVal >= 23 || bmiVal < 18.5 ? "yellow" : "green";

  const hrRisk: "green" | "yellow" | "orange" | "red" =
    latest.heartRate > 100 || latest.heartRate < 60 ? "yellow" : "green";

  return (
    <MobileShell role="caregiver" title="หน้าหลักผู้ดูแล">
      <Card className="bg-gradient-to-br from-sky-500 to-teal-400 text-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-5">
          <p className="text-sm font-semibold opacity-90">ดูแลผู้ป่วย 1 คน</p>
          <h2 className="mt-1 text-2xl font-bold">{patient.name}</h2>
          <p className="mt-2 text-sm opacity-90">{patient.diagnosis.join(" · ")}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="ความดันล่าสุด"
          value={`${latest.systolic}/${latest.diastolic}`}
          unit="mmHg"
          icon={HeartPulse}
          riskLevel={bpRisk}
          onInfoClick={() => setActiveTip({
            title: "ความดันโลหิต (Blood Pressure)",
            content: (
              <>
                <p className="font-bold text-slate-800">เกณฑ์ระดับความดันโลหิต (mmHg):</p>
                <div className="grid grid-cols-1 gap-1.5 mt-2 text-xs">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold">ปกติ: น้อยกว่า 120/80 mmHg</div>
                  <div className="p-2 bg-amber-50 text-amber-800 rounded-xl font-bold">เฝ้าระวัง: 120-139 / 80-89 mmHg</div>
                  <div className="p-2 bg-rose-50 text-rose-800 rounded-xl font-bold">เสี่ยงสูง (ความดันสูง): 140/90 mmHg ขึ้นไป</div>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">* ควรตรวจวัดหลังจากนั่งพักร่างกายอย่างสงบแล้วอย่างน้อย 5 นาที</p>
              </>
            )
          })}
        />
        <MetricCard
          title="น้ำตาลล่าสุด"
          value={latest.bloodSugar}
          unit="mg/dL"
          icon={Droplets}
          riskLevel={bsRisk}
          onInfoClick={() => setActiveTip({
            title: "ระดับน้ำตาลในเลือด (Blood Sugar)",
            content: (
              <>
                <p className="font-bold text-slate-800">เกณฑ์ค่าน้ำตาลในเลือดหลังอดอาหาร (mg/dL):</p>
                <div className="grid grid-cols-1 gap-1.5 mt-2 text-xs">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold">ปกติ (ขณะอดอาหาร): 70 - 99 mg/dL</div>
                  <div className="p-2 bg-amber-50 text-amber-800 rounded-xl font-bold">เฝ้าระวัง (เสี่ยงเบาหวาน): 100 - 125 mg/dL</div>
                  <div className="p-2 bg-rose-50 text-rose-800 rounded-xl font-bold">เสี่ยงสูง (โรคเบาหวาน): 126 mg/dL ขึ้นไป</div>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">* การตรวจควรอดอาหารและเครื่องดื่มอย่างน้อย 8 ชั่วโมงก่อนวัด</p>
              </>
            )
          })}
        />
        <MetricCard
          title="ดัชนีมวลกาย"
          value={bmiVal}
          unit="kg/m²"
          icon={Scale}
          riskLevel={bmiRisk}
          onInfoClick={() => setActiveTip({
            title: "ดัชนีมวลกาย (BMI)",
            content: (
              <>
                <p className="font-bold text-slate-800">เกณฑ์ดัชนีมวลกาย (BMI) สำหรับชาวเอเชีย:</p>
                <div className="grid grid-cols-1 gap-1.5 mt-2 text-xs">
                  <div className="p-2 bg-sky-50 text-sky-800 rounded-xl font-bold">น้ำหนักต่ำกว่าเกณฑ์: ต่ำกว่า 18.5</div>
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold">สมส่วน/ปกติ: 18.5 - 22.9</div>
                  <div className="p-2 bg-amber-50 text-amber-800 rounded-xl font-bold">น้ำหนักเกิน (เฝ้าระวัง): 23.0 - 24.9</div>
                  <div className="p-2 bg-rose-50 text-rose-800 rounded-xl font-bold">โรคอ้วน (เสี่ยงสูง): 25.0 ขึ้นไป</div>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">* คำนวณจาก: น้ำหนักตัว (กิโลกรัม) หารด้วย ส่วนสูงยกกำลังสอง (เมตร²)</p>
              </>
            )
          })}
        />
        <MetricCard
          title="ชีพจร"
          value={latest.heartRate}
          unit="bpm"
          icon={Activity}
          riskLevel={hrRisk}
          onInfoClick={() => setActiveTip({
            title: "อัตราเต้นของหัวใจ (Heart Rate)",
            content: (
              <>
                <p className="font-bold text-slate-800">เกณฑ์อัตราชีพจรเต้นขณะพัก (bpm):</p>
                <div className="grid grid-cols-1 gap-1.5 mt-2 text-xs">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold">ปกติขณะพัก: 60 - 100 ครั้งต่อนาที</div>
                  <div className="p-2 bg-amber-50 text-amber-800 rounded-xl font-bold">เฝ้าระวังเต้นช้า: ต่ำกว่า 60 ครั้งต่อนาที</div>
                  <div className="p-2 bg-rose-50 text-rose-800 rounded-xl font-bold">เฝ้าระวังเต้นเร็ว: สูงกว่า 100 ครั้งต่อนาที</div>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">* ตรวจวัดขณะนั่งพักสบายใจ ปราศจากความเครียดและความเหนื่อยล้า</p>
              </>
            )
          })}
        />
      </div>

      {/* Treatment Target Section */}
      <Card className="border border-sky-100 shadow-sm bg-gradient-to-r from-sky-50 to-indigo-50/50 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Target className="h-4 w-4 text-sky-600" />
            เป้าหมายการดูแลระดับน้ำตาลและความดันโลหิตของคนไข้
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="bg-white p-3 rounded-2xl border border-sky-100/50 space-y-1">
            <p className="text-xs font-bold text-slate-700">ค่าน้ำตาลเจาะจากปลายนิ้วตอนเช้า (ก่อนทานอาหาร)</p>
            <p className="text-[11px] text-slate-500 leading-normal">
              ควรดูแลให้อยู่ในช่วงระหว่าง <span className="font-bold text-sky-700">80 ถึง 130 mg/dL</span>
            </p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-sky-100/50 space-y-1">
            <p className="text-xs font-bold text-slate-700">ค่าน้ำตาลสะสมเฉลี่ยในร่างกายระยะยาว</p>
            <p className="text-[11px] text-slate-500 leading-normal">
              ควรดูแลให้ <span className="font-bold text-sky-700">น้อยกว่า 7%</span>
            </p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-sky-100/50 space-y-1">
            <p className="text-xs font-bold text-slate-700">ค่าความดันโลหิต</p>
            <p className="text-[11px] text-slate-500 leading-normal">
              ควรดูแลให้ <span className="font-bold text-teal-700">ต่ำกว่า 130/80 mmHg</span> เพื่อความปลอดภัย
            </p>
          </div>
        </CardContent>
      </Card>

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

      {/* Info popover modal */}
      {activeTip && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setActiveTip(null)}
        >
          <div
            className="w-full max-w-md rounded-t-[2.5rem] bg-white p-6 pb-8 shadow-2xl transition-transform duration-300 translate-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-sky-600" />
              {activeTip.title}
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600">
              {activeTip.content}
            </div>
            <Button className="w-full mt-6 rounded-2xl py-3 text-sm font-bold" onClick={() => setActiveTip(null)}>
              เข้าใจแล้ว
            </Button>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
