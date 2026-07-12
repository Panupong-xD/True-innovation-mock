import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "True Health Connect",
  description: "ต้นแบบแพลตฟอร์มสุขภาพสำหรับผู้ป่วย ผู้ดูแล และแพทย์"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
