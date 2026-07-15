"use client";

import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { formatThaiDate } from "@/lib/utils";

import { useAuth } from "@/lib/hooks/use-auth";

export default function CaregiverAlertsPage() {
  const { db } = useMockStore();
  const { user } = useAuth();
  const caregiver = db.caregivers.find(c => c.email === user?.email) || db.caregivers[0];
  const patient = db.patients.find((item) => item.id === caregiver.patientId) || db.patients[0];
  const notifications = db.notifications.filter((item) => item.userRole === "caregiver" && item.patientId === patient.id);

  return (
    <MobileShell role="caregiver" title="แจ้งเตือน">
      <div className="space-y-3">
        {notifications.length ? notifications.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.message}</p>
                <p className="mt-2 text-xs font-semibold text-sky-700">{formatThaiDate(item.date)}</p>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
            ไม่มีข้อความแจ้งเตือนใหม่ในขณะนี้
          </div>
        )}
      </div>
    </MobileShell>
  );
}
