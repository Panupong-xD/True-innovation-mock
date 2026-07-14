"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Bot, HeartPulse, Home, ListChecks, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Protected } from "@/components/auth/protected";
import { UserRole } from "@/lib/types";

const navConfig = {
  patient: [
    { href: "/patient", label: "Home", icon: Home },
    { href: "/patient/health", label: "สุขภาพ", icon: HeartPulse },
    { href: "/patient/care-plan", label: "แผนดูแล", icon: ListChecks },
    { href: "/patient/notifications", label: "แจ้งเตือน", icon: Bell },
    { href: "/patient/profile", label: "โปรไฟล์", icon: UserRound }
  ],
  caregiver: [
    { href: "/caregiver", label: "หน้าหลัก", icon: Home },
    { href: "/caregiver/patients", label: "ผู้ป่วย", icon: UsersRound },
    { href: "/caregiver/care-plan", label: "แผนดูแล", icon: ListChecks },
    { href: "/caregiver/ai", label: "ผู้ช่วย AI", icon: Bot },
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
  return (
    <Protected role={role}>
      <div className="mx-auto min-h-screen w-full max-w-3xl bg-gradient-to-b from-white/80 to-sky-50/80">
        <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/88 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-sky-600">Wellync</p>
              <h1 className="text-xl font-bold text-slate-950">{title}</h1>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <HeartPulse className="h-5 w-5" />
            </div>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.08 }}
          className="space-y-5 px-4 py-5 pb-28"
        >
          {children}
        </motion.main>
        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-3xl -translate-x-1/2 border-t border-sky-100 bg-white/94 px-2 pb-2 pt-2 backdrop-blur-xl">
          <div className="grid grid-cols-5 gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold text-slate-500 transition",
                    active && "bg-sky-100 text-sky-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
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
