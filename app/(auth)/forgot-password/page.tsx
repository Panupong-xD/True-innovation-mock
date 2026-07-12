"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";

const schema = z.object({
  email: z.string().email("กรุณาใส่อีเมลให้ถูกต้อง")
});

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "patient@gmail.com" }
  });

  return (
    <AuthCard
      title="ลืมรหัสผ่าน"
      subtitle="ส่งคำแนะนำการรีเซ็ตรหัสผ่านผ่าน Firebase Authentication หรือจำลองสำหรับเดโม"
      footer={<AuthLink href="/login">กลับไปเข้าสู่ระบบ</AuthLink>}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await forgotPassword(values.email);
        })}
      >
        <div>
          <Input {...register("email")} placeholder="อีเมล" autoComplete="email" />
          {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
        </div>
        <Button className="w-full" size="lg" disabled={isSubmitting}>
          <Mail className="h-5 w-5" />
          ส่งคำแนะนำ
        </Button>
      </form>
    </AuthCard>
  );
}
