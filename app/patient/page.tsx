"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, CalendarClock, Droplets, HeartPulse, Pill, Scale, ShieldCheck, Info, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { MetricCard } from "@/components/health/metric-card";
import { EarlyWarningCard } from "@/components/health/early-warning-card";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { formatThaiDate } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { HospitalCampaignCarousel } from "@/components/health/hospital-carousel";

export default function PatientHomePage() {
  const { db } = useMockStore();
  const { user } = useAuth();
  const patient = db.patients.find((item) => item.email === user?.email) || db.patients[0];
  const records = db.healthRecords.filter((record) => record.patientId === patient.id);
  const latest = records[records.length - 1];
  const plan = db.carePlans.find((item) => item.patientId === patient.id)!;
  const warning = db.earlyWarnings.find((item) => item.patientId === patient.id)!;
  const notification = db.notifications.find((item) => item.userRole === "patient" && item.type !== "hospital");
  const completed = plan.tasks.filter((task) => task.status === "completed").length;

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
    <MobileShell role="patient" title="WELLYNC">
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
                <p className="font-bold text-slate-800">เกณฑ์ค่านั่งร้านน้ำตาล (mg/dL):</p>
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

      {/* Treatment Target Section (Larger Post-it Carousel) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[15px] font-extrabold text-slate-555 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-4 w-4 text-sky-600 animate-pulse" />
            เป้าหมายการดูแลสุขภาพของคุณ
          </h3>
        </div>

        <div
          className="flex overflow-x-auto gap-6 px-2 pb-5 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Post-it 1: Sugar */}
          <div className="w-[300px] shrink-0 snap-start relative pt-3">
            {/* Masking Tape */}
            <div className="w-16 h-5 bg-white/40 backdrop-blur-[0.5px] border border-white/20 rotate-[-2deg] absolute top-1 left-1/2 -translate-x-1/2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10" />
            
            {/* Paper Note */}
            <div className="rotate-[-1.5deg] bg-[#e0f2fe] p-5 pb-3.5 shadow-[3px_6px_14px_rgba(0,0,0,0.08)] rounded-[2px] flex flex-col justify-between h-[155px] text-slate-800 border-l-[3.5px] border-sky-300">
              <div>
                <span className="text-[10px] font-black text-sky-700 bg-sky-200/50 px-2.5 py-0.5 rounded uppercase tracking-wider">เป้าหมายน้ำตาล</span>
                <p className="text-xs text-slate-700 mt-3 leading-relaxed font-semibold">
                  ค่าน้ำตาลเจาะจากปลายนิ้วตอนเช้าก่อนทานอาหาร ควรคุมให้อยู่ในช่วง <span className="font-black text-sky-900 text-[13px]">80 ถึง 130 mg/dL</span>
                </p>
              </div>
              <div className="text-[10px] font-bold text-sky-700/80 border-t border-sky-300/30 pt-2 flex justify-between">
                <span>ค่าน้ำตาลสะสมเฉลี่ยในร่างกาย:</span>
                <span className="font-extrabold text-sky-900">น้อยกว่า 7%</span>
              </div>
            </div>
          </div>

          {/* Post-it 2: BP */}
          <div className="w-[300px] shrink-0 snap-start relative pt-3">
            {/* Masking Tape */}
            <div className="w-16 h-5 bg-white/40 backdrop-blur-[0.5px] border border-white/20 rotate-[3deg] absolute top-1 left-1/2 -translate-x-1/2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10" />
            
            {/* Paper Note */}
            <div className="rotate-[1deg] bg-[#e0f2fe] p-5 pb-3.5 shadow-[3px_6px_14px_rgba(0,0,0,0.08)] rounded-[2px] flex flex-col justify-between h-[155px] text-slate-800 border-l-[3.5px] border-sky-300">
              <div>
                <span className="text-[10px] font-black text-sky-700 bg-sky-200/50 px-2.5 py-0.5 rounded uppercase tracking-wider">เป้าหมายความดัน</span>
                <p className="text-xs text-slate-700 mt-3 leading-relaxed font-semibold">
                  คุมความดันโลหิตให้อยู่ในเกณฑ์ที่ปลอดภัย <span className="font-black text-sky-900 text-[13px]">ต่ำกว่า 130/80 mmHg</span>
                </p>
              </div>
              <div className="text-[10px] font-bold text-sky-700/80 border-t border-sky-300/30 pt-2 flex justify-between">
                <span>เป้าหมายเพื่อป้องกัน:</span>
                <span className="font-extrabold text-sky-900">โรคแทรกซ้อนหลอดเลือด</span>
              </div>
            </div>
          </div>

          {/* Post-it 3: Exercise */}
          <div className="w-[300px] shrink-0 snap-start relative pt-3">
            {/* Masking Tape */}
            <div className="w-16 h-5 bg-white/40 backdrop-blur-[0.5px] border border-white/20 rotate-[-1deg] absolute top-1 left-1/2 -translate-x-1/2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10" />
            
            {/* Paper Note */}
            <div className="rotate-[-1deg] bg-[#e0f2fe] p-5 pb-3.5 shadow-[3px_6px_14px_rgba(0,0,0,0.08)] rounded-[2px] flex flex-col justify-between h-[155px] text-slate-850 border-l-[3.5px] border-sky-300">
              <div>
                <span className="text-[10px] font-black text-sky-700 bg-sky-200/50 px-2.5 py-0.5 rounded uppercase tracking-wider">เป้าหมายกิจกรรม</span>
                <p className="text-xs text-slate-700 mt-3 leading-relaxed font-semibold">
                  ออกกำลังกายเบาๆ เช่น เดินเร็วสะสมความเหนื่อยให้ได้ <span className="font-black text-sky-900 text-[13px]">150 นาทีต่อสัปดาห์</span>
                </p>
              </div>
              <div className="text-[10px] font-bold text-sky-700/80 border-t border-sky-300/30 pt-2 flex justify-between">
                <span>คำแนะนำแพทย์:</span>
                <span className="font-extrabold text-sky-900">เฉลี่ยวันละ 30 นาที 5 วัน</span>
              </div>
            </div>
          </div>
        </div>
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

      <HospitalCampaignCarousel />

      {notification ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-bold text-slate-900">{notification.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{notification.message}</p>
          </CardContent>
        </Card>
      ) : null}

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
