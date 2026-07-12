"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";

const schema = z.object({
  email: z.string().email("กรุณาใส่อีเมลให้ถูกต้อง"),
  password: z.string().min(4, "รหัสผ่านอย่างน้อย 4 ตัวอักษร")
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "patient@gmail.com", password: "demo1234" }
  });

  return (
    <AuthCard
      title="เข้าสู่ระบบ"
      subtitle="เลือกบทบาทจากอีเมลเพื่อทดลอง workflow ผู้ป่วย ผู้ดูแล หรือแพทย์"
      footer={
        <>
          ยังไม่มีบัญชี? <AuthLink href="/register">สมัครสมาชิก</AuthLink> ·{" "}
          <AuthLink href="/forgot-password">ลืมรหัสผ่าน</AuthLink>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {[
          ["ผู้ป่วย", "patient@gmail.com"],
          ["ผู้ดูแล", "caregiver@gmail.com"],
          ["แพทย์", "doctor@gmail.com"]
        ].map(([label, email]) => (
          <Button key={email} type="button" variant="secondary" size="sm" onClick={() => setValue("email", email)}>
            {label}
          </Button>
        ))}
      </div>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await login(values.email, values.password);
        })}
      >
        <div>
          <Input {...register("email")} placeholder="อีเมล" autoComplete="email" />
          {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <Input {...register("password")} type="password" placeholder="รหัสผ่าน" autoComplete="current-password" />
          {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password.message}</p> : null}
        </div>
        <Button className="w-full" size="lg" disabled={isSubmitting}>
          <LogIn className="h-5 w-5" />
          เข้าสู่ระบบ
        </Button>
      </form>
    </AuthCard>
  );
}
