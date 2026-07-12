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
  register: (email: string, password: string) => Promise<AppUser>;
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
      register: async (email, password) => {
        const nextUser = registerWithEmail(email);
        setUser(nextUser);
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
