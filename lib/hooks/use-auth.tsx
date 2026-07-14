"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppUser, UserRole } from "@/lib/types";
import { loginWithEmail, logoutUser, readMockUser, registerWithEmail, resetPassword } from "@/lib/services/auth";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (email: string, password: string, name?: string, extra?: any) => Promise<AppUser>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => readMockUser());
  const [loading] = useState(false);
  const router = useRouter();

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const nextUser = loginWithEmail(email);
        setUser(nextUser);
        toast.success("เข้าสู่ระบบสำเร็จ");
        router.push(`/${nextUser.role}`);
        return nextUser;
      },
      register: async (email, password, name, extra) => {
        const patientId = `HN-${Math.floor(100000 + Math.random() * 900000)}`;
        const role = extra?.role || "patient";
        
        const nextUser: AppUser = {
          uid: role === "patient" ? patientId : `USR-${Date.now()}`,
          email,
          name: name || "ผู้ใช้ใหม่",
          role
        };
        
        setUser(nextUser);
        localStorage.setItem("mock-auth-user", JSON.stringify(nextUser));
        
        if (role === "patient") {
          const { loadMockStore, persistMockStore } = await import("@/lib/services/mock-store");
          const db = loadMockStore();
          const newPatient = {
            id: patientId,
            citizenId: extra?.citizenId || "",
            name: name || "ผู้ใช้ใหม่",
            age: Number(extra?.age || 30),
            gender: extra?.gender || "ชาย",
            diagnosis: ["เบาหวานชนิดที่ 2", "ความดันโลหิตสูง"],
            allergies: [],
            medications: ["Metformin 500mg", "Amlodipine 5mg"],
            doctorId: "demo-doctor",
            caregiverId: "demo-caregiver",
            hospital: "โรงพยาบาล",
            healthScore: 85,
            email,
            dob: extra?.dob || "",
            weight: Number(extra?.weight || 70),
            height: Number(extra?.height || 170),
            phone: extra?.phone || "",
            occupation: extra?.occupation || "",
            address: extra?.address || "",
            pin: extra?.pin || ""
          };
          
          db.patients.push(newPatient);
          
          db.chatHistory[patientId] = [
            {
              id: `msg-${Date.now()}`,
              role: "assistant",
              content: `สวัสดีครับคุณ ${name} ยินดีต้อนรับสู่ระบบติดตามสุขภาพอัจฉริยะ ผมเป็น AI ประเมินประวัติสุขภาพส่วนตัวของคุณครับ มีเรื่องอะไรปรึกษาด้านสุขภาพเบาหวานและความดันวันนี้ไหมครับ?`,
              time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
            }
          ];
          
          db.carePlans.push({
            id: `plan-${patientId}`,
            patientId: patientId,
            doctorId: "demo-doctor",
            status: "approved",
            updatedAt: new Date().toISOString(),
            summary: "ควบคุมอาหารเค็มและน้ำตาลอย่างสม่ำเสมอ ออกกำลังกายเบาๆ",
            medication: ["Metformin 500mg (เช้า-เย็น หลังอาหาร)", "Amlodipine 5mg (เช้า หลังอาหาร)"],
            diet: ["ลดคาร์โบไฮเดรตเชิงเดี่ยว ชา กาแฟหวาน", "เน้นโปรตีนไขมันต่ำ ผักต้ม"],
            exercise: ["เดินเร็ว 30 นาทีต่อวัน", "สัปดาห์ละ 3-5 วัน"],
            measurement: ["วัดความดันทุกเช้าก่อนทานอาหาร", "เจาะระดับน้ำตาลสัปดาห์ละ 2 ครั้ง"],
            followUp: ["พบแพทย์เพื่อประเมินผลในอีก 2 เดือน"],
            lifestyle: ["นอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมง", "ดื่มน้ำสะอาดวันละ 8 แก้ว"],
            tasks: [
              {
                id: `task-${patientId}-1`,
                title: "ทานยา Metformin 500mg",
                category: "medication",
                time: "08:00",
                detail: "เช้า หลังอาหารทันที",
                status: "pending"
              },
              {
                id: `task-${patientId}-2`,
                title: "วัดระดับความดันและชีพจร",
                category: "measurement",
                time: "07:30",
                detail: "วัดด้วยเครื่องวัดอัตโนมัติก่อนทานอาหาร",
                status: "pending"
              }
            ]
          });
          
          persistMockStore(db);
        }
        
        toast.success("สร้างบัญชีสำเร็จ");
        router.push(`/${nextUser.role}`);
        return nextUser;
      },
      forgotPassword: async (email) => {
        resetPassword(email);
        toast.success("ส่งคำแนะนำรีเซ็ตรหัสผ่านแล้ว");
      },
      logout: async () => {
        logoutUser();
        setUser(null);
        router.push("/login");
      }
    }),
    [loading, router, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function useRoleGuard(role: UserRole) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    if (user && user.role !== role) router.push("/unauthorized");
  }, [loading, role, router, user]);

  return { user, loading, allowed: Boolean(user && user.role === role) };
}
