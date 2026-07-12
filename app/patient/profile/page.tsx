"use client";

import { BellRing, Bluetooth, Building2, Clock, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMockStore } from "@/lib/hooks/use-mock-store";

export default function PatientProfilePage() {
  const { logout, user } = useAuth();
  const { db } = useMockStore();
  const patient = db.patients.find((item) => item.email === user?.email) || db.patients[0];
  const caregiver = db.caregivers.find((item) => item.patientId === patient.id);
  const consents = db.consents.filter((item) => item.patientId === patient.id);

  return (
    <MobileShell role="patient" title="โปรไฟล์">
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
            <UserRound className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{patient.name}</h2>
            <p className="text-sm text-slate-500">Patient ID {patient.id} · อายุ {patient.age}</p>
          </div>
        </CardContent>
      </Card>

      {[
        [Building2, "Hospital Connections", `${patient.hospital} · เชื่อมต่อผ่าน TRUE IDC`],
        [Bluetooth, "Connected Devices", "เครื่องวัดความดัน · เครื่องชั่งน้ำหนัก · Smart Watch"],
        [BellRing, "Notification Settings", "ยา นัดหมาย Early Warning และ AI Recommendation"],
        [Clock, "Consent History", `${consents.length} รายการ · ผู้ป่วยเป็นเจ้าของข้อมูลตาม PDPA`]
      ].map(([Icon, title, text]) => (
        <Card key={String(title)}>
          <CardContent className="flex gap-3 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold">{title as string}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{text as string}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle>ผู้ดูแลที่เชื่อมต่อ</CardTitle></CardHeader>
        <CardContent>
          <p className="font-bold">{caregiver?.name}</p>
          <p className="text-sm text-slate-500">{caregiver?.relationship} · ยืนยันข้อมูลสุขภาพแทนแพทย์ก่อน review</p>
        </CardContent>
      </Card>

      <Button 
        className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/25 active:scale-[0.98] transition-all duration-300 font-bold border-none py-3 h-12 flex items-center justify-center gap-2" 
        onClick={logout}
      >
        <LogOut className="h-5 w-5" />
        ออกจากระบบ
      </Button>
    </MobileShell>
  );
}
