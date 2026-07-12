"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, HeartPulse, Loader2, Plus, Trash2, Upload, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileShell } from "@/components/layouts/mobile-shell";
import { AdherenceChart, MultiMetricChart, TrendChart } from "@/components/health/charts";
import { MockChat } from "@/components/chat/mock-chat";
import { useMockStore } from "@/lib/hooks/use-mock-store";
import { addHealthRecord, deleteHealthRecord } from "@/lib/services/mock-store";
import { askAI } from "@/lib/services/ai/client";
import { formatThaiDate } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useAuth } from "@/lib/hooks/use-auth";

function compressAndResizeImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2d context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 jpeg with compression quality (0.7)
        const base64 = canvas.toDataURL("image/jpeg", quality);
        resolve(base64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function PatientHealthPage() {
  const { db, setDb } = useMockStore();
  const { user } = useAuth();
  const patient = db.patients.find((item) => item.email === user?.email) || db.patients[0];
  const records = useMemo(
    () => db.healthRecords.filter((record) => record.patientId === patient.id),
    [db.healthRecords, patient.id]
  );
  const latest = records[records.length - 1];
  interface FoodAnalysis {
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    sugar: string;
    sodium: string;
    score: string;
    recommendation: string;
  }

  const [scannerReady, setScannerReady] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis | null>(null);
  const [foodImage, setFoodImage] = useState<string | null>(null);
  const [foodNameInput, setFoodNameInput] = useState("");
  const [foodFilesPayload, setFoodFilesPayload] = useState<Array<{ type: string; name: string; data: string }>>([]);
  const [form, setForm] = useState({
    systolic: String(latest.systolic),
    diastolic: String(latest.diastolic),
    bloodSugar: String(latest.bloodSugar),
    weight: String(latest.weight),
    sleepHours: "7",
    exerciseMinutes: "20"
  });

  function submitRecord() {
    setDb((current) =>
      addHealthRecord(current, {
        patientId: patient.id,
        date: new Date().toISOString(),
        systolic: Number(form.systolic),
        diastolic: Number(form.diastolic),
        bloodSugar: Number(form.bloodSugar),
        heartRate: latest.heartRate,
        weight: Number(form.weight),
        sleepHours: Number(form.sleepHours),
        exerciseMinutes: Number(form.exerciseMinutes),
        medicationTaken: true,
        foodScore: 78,
        waterGlasses: 6,
        source: "patient",
        confirmationStatus: "pending",
        note: "บันทึกโดยผู้ป่วย รอยืนยันจากผู้ดูแล"
      })
    );
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const nameWithoutExt = file.name.split(".")[0];
      const cleanName = nameWithoutExt.replace(/[-_]/g, " ").replace(/\d+/g, "").trim() || "อาหารทั่วไป";
      setFoodNameInput(cleanName);
      const imageUrl = URL.createObjectURL(file);
      setFoodImage(imageUrl);
      setScannerReady(true);
      
      try {
        setScannerLoading(true);
        const base64Data = await compressAndResizeImage(file);
        const filesArray = [
          {
            type: "image",
            name: file.name.split(".")[0] + ".jpg",
            data: base64Data
          }
        ];
        setFoodFilesPayload(filesArray);
        runFoodAnalysis(cleanName, filesArray);
      } catch (error) {
        console.error("Error reading file to base64:", error);
        setFoodFilesPayload([]);
        runFoodAnalysis(cleanName, []);
      }
    }
  }

  async function runFoodAnalysis(name: string, filesArray?: Array<{ type: string; name: string; data: string }>) {
    setScannerLoading(true);
    setFoodAnalysis(null);
    try {
      const prompt = [
        "บทบาท: คุณคือ AI วิเคราะห์สารอาหาร (Food Scanner) ในแอปพลิเคชันสำหรับผู้ป่วยเบาหวานชนิดที่ 2 และความดันโลหิตสูง",
        "วิเคราะห์รูปภาพอาหารที่อัปโหลดแนบมาด้วยนี้ (ถ้ามีไฟล์ภาพส่งมา ให้วิเคราะห์จากรูปภาพอาหารจริง) หรือตามชื่อเมนูอาหารด้านล่าง:",
        `เมนูอาหาร: "${name}"`,
        "ให้ประเมินสารอาหารและคำแนะนำ โดยตอบกลับมาเป็น JSON เปล่าๆ รูปแบบนี้เท่านั้น ห้ามมีคำอธิบายอื่นนอกเหนือจาก JSON:",
        JSON.stringify({
          name: "ชื่อเมนูภาษาไทยที่ตรงกับอาหารที่สุด (เช่น ข้าวผัดกะเพราไข่ดาว)",
          calories: "ค่าพลังงาน (เช่น 520 kcal)",
          protein: "ปริมาณโปรตีน (เช่น 25 g)",
          carbs: "ปริมาณคาร์โบไฮเดรต (เช่น 65 g)",
          fat: "ปริมาณไขมัน (เช่น 18 g)",
          sugar: "ปริมาณน้ำตาล (เช่น 4 g)",
          sodium: "ปริมาณโซเดียม (เช่น 680 mg)",
          score: "คะแนนโภชนาการ (เช่น 75/100)",
          recommendation: "คำแนะนำสุขภาพสั้นๆ 2-3 ข้อเกี่ยวกับการบริโภคเมนูนี้สำหรับผู้ป่วยเบาหวานและความดันโลหิตสูงอย่างกระชับ"
        }, null, 2)
      ].join("\n");

      const answer = await askAI(prompt, filesArray);
      
      let cleanJson = answer.trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      
      const data = JSON.parse(cleanJson) as FoodAnalysis;
      setFoodAnalysis(data);
    } catch (error) {
      console.error("Failed parsing food scanner JSON:", error);
      setFoodAnalysis({
        name: name,
        calories: "ไม่ระบุ",
        protein: "ไม่ระบุ",
        carbs: "ไม่ระบุ",
        fat: "ไม่ระบุ",
        sugar: "ไม่ระบุ",
        sodium: "ไม่ระบุ",
        score: "ไม่ระบุ",
        recommendation: error instanceof Error ? `วิเคราะห์ข้อมูลไม่สำเร็จ: ${error.message}` : "วิเคราะห์อาหารขัดข้อง"
      });
    } finally {
      setScannerLoading(false);
    }
  }

  return (
    <MobileShell role="patient" title="สุขภาพ">
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="records">บันทึก</TabsTrigger>
          <TabsTrigger value="charts">กราฟ</TabsTrigger>
          <TabsTrigger value="food">อาหาร</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-sky-600" />
                เพิ่มข้อมูลสุขภาพ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["systolic", "ความดันตัวบน (SYS) - mmHg", "ตัวบน"],
                  ["diastolic", "ความดันตัวล่าง (DIA) - mmHg", "ตัวล่าง"],
                  ["bloodSugar", "ระดับน้ำตาล - mg/dL", "น้ำตาล"],
                  ["weight", "น้ำหนักตัว - kg", "น้ำหนัก"],
                  ["sleepHours", "ชั่วโมงนอน - ชม.", "ชั่วโมงนอน"],
                  ["exerciseMinutes", "นาทีออกกำลัง - นาที", "นาทีออกกำลัง"]
                ].map(([key, label, shortPlaceholder]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 pl-1">{label}</label>
                    <Input
                      value={form[key as keyof typeof form]}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                      placeholder={shortPlaceholder}
                      inputMode="decimal"
                    />
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={submitRecord}>
                <CheckCircle2 className="h-5 w-5" />
                บันทึกและส่งให้ผู้ดูแลยืนยัน
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {records.slice(-7).reverse().map((record) => (
              <Card key={record.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{record.systolic}/{record.diastolic} · น้ำตาล {record.bloodSugar}</p>
                    <p className="text-xs text-slate-500">{formatThaiDate(record.date)} · {record.source === "patient" ? "ผู้ป่วยบันทึก" : "อุปกรณ์/ผู้ดูแล"}</p>
                  </div>
                  <Badge tone={record.confirmationStatus === "confirmed" ? "green" : record.confirmationStatus === "rejected" ? "red" : "yellow"}>
                    {record.confirmationStatus === "confirmed" ? "ยืนยันแล้ว" : record.confirmationStatus === "rejected" ? "ปฏิเสธ" : "รอยืนยัน"}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => setDb((current) => deleteHealthRecord(current, record.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <MultiMetricChart records={records} />
        </TabsContent>

        <TabsContent value="food" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5 text-sky-600" /> Food Scanner</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex flex-1 min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 text-center p-4">
                  <Upload className="h-8 w-8 text-sky-600" />
                  <span className="mt-2 font-semibold text-slate-700">อัปโหลดรูปอาหาร</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                {foodImage ? (
                  <div className="relative flex-1 min-h-40 overflow-hidden rounded-2xl border bg-slate-100 flex items-center justify-center p-2">
                    <img src={foodImage} alt="Food preview" className="max-h-40 object-contain w-full h-full rounded-xl" />
                  </div>
                ) : null}
              </div>

              {scannerReady ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={foodNameInput}
                      onChange={(e) => setFoodNameInput(e.target.value)}
                      placeholder="ระบุชื่ออาหารหากชื่อไฟล์ไม่ตรงกับรูปภาพ (เช่น ข้าวผัดกะเพรา)..."
                      className="flex-1"
                      disabled={scannerLoading}
                    />
                    <Button onClick={() => runFoodAnalysis(foodNameInput, foodFilesPayload)} disabled={scannerLoading}>
                      วิเคราะห์ใหม่
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {scannerLoading ? (
                      <div className="col-span-2 flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl bg-white p-8 text-sky-600 shadow-card">
                        <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                        <p className="font-semibold text-slate-700">AI กำลังวิเคราะห์รูปภาพอาหาร...</p>
                      </div>
                    ) : foodAnalysis ? (
                      <>
                        {[
                          ["ชื่ออาหาร", foodAnalysis.name],
                          ["Calories", foodAnalysis.calories],
                          ["Protein", foodAnalysis.protein],
                          ["Carbohydrate", foodAnalysis.carbs],
                          ["Fat", foodAnalysis.fat],
                          ["Sugar", foodAnalysis.sugar],
                          ["Sodium", foodAnalysis.sodium],
                          ["Nutrition Score", foodAnalysis.score]
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl bg-white p-3 shadow-card">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="font-bold text-slate-900">{value}</p>
                          </div>
                        ))}
                        <div className="col-span-2 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                          <p className="font-bold mb-2">คำแนะนำโภชนาการสำหรับคุณ:</p>
                          <MarkdownRenderer content={foodAnalysis.recommendation} />
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <MockChat
            title="ผู้ช่วย AI ของผู้ป่วย"
            seedMessages={db.chatHistory.patient}
            mode="patient"
            context={`ผู้ป่วย ${patient.name}; diagnosis ${patient.diagnosis.join(", ")}; medication ${patient.medications.join(", ")}; BP ล่าสุด ${latest.systolic}/${latest.diastolic}; blood sugar ล่าสุด ${latest.bloodSugar}; exercise ${latest.exerciseMinutes} นาที; sleep ${latest.sleepHours} ชั่วโมง`}
          />
        </TabsContent>
      </Tabs>
    </MobileShell>
  );
}
