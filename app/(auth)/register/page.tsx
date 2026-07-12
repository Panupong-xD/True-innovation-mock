"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";

const schema = z
  .object({
    email: z.string().email("กรุณาใส่อีเมลให้ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
    confirm: z.string()
  })
  .refine((data) => data.password === data.confirm, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirm"]
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "patient@gmail.com", password: "demo1234", confirm: "demo1234" }
  });

  return (
    <AuthCard
      title="สมัครสมาชิก"
      subtitle="สร้างบัญชีทดลอง ระบบจะแยกบทบาทจากอีเมลและพร้อมย้ายไปตรวจสอบ role ในฐานข้อมูลภายหลัง"
      footer={
        <>
          มีบัญชีแล้ว? <AuthLink href="/login">เข้าสู่ระบบ</AuthLink>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await registerUser(values.email, values.password);
        })}
      >
        <div>
          <Input {...register("email")} placeholder="อีเมล" autoComplete="email" />
          {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <Input {...register("password")} type="password" placeholder="รหัสผ่าน" autoComplete="new-password" />
          {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password.message}</p> : null}
        </div>
        <div>
          <Input {...register("confirm")} type="password" placeholder="ยืนยันรหัสผ่าน" autoComplete="new-password" />
          {errors.confirm ? <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p> : null}
        </div>
        <Button className="w-full" size="lg" disabled={isSubmitting}>
          <UserPlus className="h-5 w-5" />
          สมัครสมาชิก
        </Button>
      </form>
    </AuthCard>
  );
}
