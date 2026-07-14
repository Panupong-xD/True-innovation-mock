"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, HeartPulse, Home, ListChecks, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Protected } from "@/components/auth/protected";
import { UserRole } from "@/lib/types";
import { useMockStore } from "@/lib/hooks/use-mock-store";

const navConfig = {
  patient: [
    { href: "/patient", label: "หน้าหลัก", icon: Home },
    { href: "/patient/health", label: "สุขภาพ", icon: HeartPulse },
    { href: "/patient/care-plan", label: "แผนดูแล", icon: ListChecks },
    { href: "/patient/profile", label: "โปรไฟล์", icon: UserRound }
  ],
  caregiver: [
    { href: "/caregiver", label: "หน้าหลัก", icon: Home },
    { href: "/caregiver/patients", label: "ผู้ป่วย", icon: UsersRound },
    { href: "/caregiver/care-plan", label: "แผนดูแล", icon: ListChecks },
    { href: "/caregiver/profile", label: "โปรไฟล์", icon: UserRound }
  ]
};

export function MobileShell({
  role,
  title,
  children
}: {
  role: Extract<UserRole, "patient" | "caregiver">;
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navItems = navConfig[role];
  const { db } = useMockStore();

  // Dynamic notification & alert badges
  let hasIndicator = false;
  if (role === "patient") {
    // Check for patient notifications (excluding hospital campaigns)
    hasIndicator = db.notifications.some((n) => n.userRole === "patient" && n.type !== "hospital");
  } else if (role === "caregiver") {
    // Check if caregiver's patient is in early warning state (red, orange, or yellow risk)
    const patientId = db.caregivers[0]?.patientId;
    const warning = db.earlyWarnings.find((w) => w.patientId === patientId);
    hasIndicator = warning ? (warning.status === "red" || warning.status === "orange" || warning.status === "yellow") : false;
  }

  return (
    <Protected role={role}>
      <div className="mx-auto min-h-screen w-full max-w-3xl bg-gradient-to-b from-white/80 to-sky-50/80">
        <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/88 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              {title === "WELLYNC" ? (
                <h1 className="text-[20px] font-black text-sky-600 tracking-wider uppercase">WELLYNC</h1>
              ) : (
                <>
                  <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Wellync</p>
                  <h1 className="text-[17px] font-extrabold text-slate-950 mt-0.5">{title}</h1>
                </>
              )}
            </div>
            
            {/* Top-Right Notification/Alert Button (Bell icon for both Patient and Caregiver) */}
            {role === "patient" ? (
              <Link
                href="/patient/notifications"
                className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors relative shrink-0"
                aria-label="การแจ้งเตือน"
              >
                <Bell className="h-4.5 w-4.5" />
                {hasIndicator && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border border-white animate-bounce" />
                )}
              </Link>
            ) : (
              <Link
                href="/caregiver/alerts"
                className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors relative shrink-0"
                aria-label="การแจ้งเตือนและการดูแลความเสี่ยง"
              >
                <Bell className="h-4.5 w-4.5" />
                {hasIndicator && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border border-white animate-pulse" />
                )}
              </Link>
            )}
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.08 }}
          className="space-y-4 px-5 py-4 pb-24"
        >
          {children}
        </motion.main>

        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-3xl -translate-x-1/2 border-t border-sky-100 bg-white/94 px-4 pb-2.5 pt-1.5 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold text-slate-500 transition",
                    active && "bg-sky-50 text-sky-700"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </Protected>
  );
}
