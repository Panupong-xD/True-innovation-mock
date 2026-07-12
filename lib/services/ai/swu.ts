import { gotScraping } from "got-scraping";

const SWU_BASE_URL = "https://swuai.swu.ac.th";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

interface SwuChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  content?: string;
  message?: string;
  response?: string;
  answer?: string;
  data?: {
    content?: string;
    message?: string;
    response?: string;
    answer?: string;
  };
}

function getSwuConfig() {
  return {
    apiKey: process.env.SWU_API_KEY,
    userId: process.env.SWU_USER_ID,
    model: process.env.SWU_MODEL || DEFAULT_MODEL
  };
}

export function isSwuConfigured(apiKey?: string, userId?: string) {
  const config = getSwuConfig();
  return Boolean((apiKey || config.apiKey) && (userId || config.userId));
}

function extractText(payload: SwuChatResponse) {
  return (
    payload.choices?.[0]?.message?.content ||
    payload.content ||
    payload.message ||
    payload.response ||
    payload.answer ||
    payload.data?.content ||
    payload.data?.message ||
    payload.data?.response ||
    payload.data?.answer ||
    ""
  );
}

export async function getSwuModels(apiKey?: string, userId?: string) {
  const config = getSwuConfig();
  const key = apiKey || config.apiKey;
  const uid = userId || config.userId;

  if (!key || !uid) {
    return { configured: false, models: [] };
  }

  try {
    const response = await gotScraping({
      url: `${SWU_BASE_URL}/swu/api/service/get-all-models`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`
      },
      json: { user_id: uid },
      responseType: "json",
      http2: false // Force HTTP/1.1 to prevent stream abort/protocol compatibility issues
    });

    const data = response.body as { models?: Array<{ name: string } | string> };
    const modelNames = Array.isArray(data.models)
      ? data.models.map((m) => (typeof m === "object" && m !== null ? m.name : String(m)))
      : [];

    return { configured: true, models: modelNames };
  } catch (error) {
    const err = error as any;
    if (err.response && err.response.statusCode === 403) {
      throw new Error("ติดระบบป้องกันของ Cloudflare (403) - กรุณาเชื่อมต่อ SWU VPN หรือตรวจสอบความถูกต้องของสิทธิ์การเข้าถึง");
    }
    throw new Error(`SWU models request failed: ${err.message}`);
  }
}

export async function chatWithSwuAI(
  content: string,
  model?: string,
  apiKey?: string,
  userId?: string,
  files?: Array<{ type: string; name: string; data: string }>
) {
  const config = getSwuConfig();
  const key = apiKey || config.apiKey;
  const uid = userId || config.userId;
  const targetModel = model || config.model;

  if (!key || !uid) {
    throw new Error("SWU AI is not configured. Set SWU_API_KEY and SWU_USER_ID in settings or .env.local.");
  }

  try {
    const response = await gotScraping({
      url: `${SWU_BASE_URL}/swu/api/service/chat`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`
      },
      json: {
        user_id: uid,
        model: targetModel,
        content,
        files: files || []
      },
      responseType: "json",
      http2: false // Force HTTP/1.1 to prevent stream abort/protocol compatibility issues
    });

    const payload = response.body as SwuChatResponse;
    const text = extractText(payload);
    
    // Check if Cloudflare challenged the request
    const rawString = typeof response.body === "string" ? response.body : JSON.stringify(response.body);
    if (isHtmlOrCloudflare(rawString) || isHtmlOrCloudflare(text)) {
      throw new Error("CLOUDFLARE_BLOCKED");
    }
    
    return {
      configured: true,
      model: targetModel,
      text: text || JSON.stringify(payload)
    };
  } catch (error) {
    const err = error as any;
    if (
      err.message?.includes("CLOUDFLARE_BLOCKED") ||
      (err.response && (err.response.statusCode === 403 || err.response.statusCode === 503)) ||
      err.message?.includes("403") ||
      err.message?.includes("503")
    ) {
      throw new Error("CLOUDFLARE_BLOCKED");
    }
    
    if (err.response) {
      throw new Error(`SWU chat request failed: ${err.response.statusCode} ${JSON.stringify(err.response.body)}`);
    }
    throw new Error(`SWU chat request failed: ${err.message}`);
  }
}

function isHtmlOrCloudflare(text: string): boolean {
  if (typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("<!doctype html>") ||
    lower.includes("<html") ||
    lower.includes("just a moment...") ||
    lower.includes("cloudflare") ||
    lower.includes("challenge") ||
    lower.includes("noscript")
  );
}

export function generateFallbackResponse(prompt: string): string {
  const query = prompt.toLowerCase();
  
  if (query.includes("กิน") || query.includes("อาหาร") || query.includes("เมนู") || query.includes("ข้าว") || query.includes("หวาน")) {
    return `สำหรับผู้ป่วยเบาหวานชนิดที่ 2 และความดันโลหิตสูง อาหารที่เหมาะสมมีดังนี้ค่ะ:

**คาร์โบไฮเดรตเชิงซ้อน (ช่วยคุมน้ำตาลสะสม)**
* ข้าวกล้อง ข้าวไรซ์เบอร์รี่ หรือขนมปังโฮลวีต (ทานในปริมาณที่พอดี ไม่ล้นจาน)
* ธัญพืชไม่ขัดสี และถั่วเมล็ดแห้งต่างๆ

**โปรตีนไขมันต่ำ (ช่วยซ่อมแซมร่างกาย)**
* เนื้อปลาต้ม นึ่ง หรือแกงจืด (เช่น ปลาทู ปลานิล ปลาแซลมอน)
* อกไก่ เต้าหู้ไข่ หรือไข่ขาว

**ผักและสมุนไพร (เพิ่มใยอาหารและช่วยลดความดัน)**
* ผักใบเขียว เช่น ผักบุ้ง คะน้า กวางตุ้ง (ต้มหรือผัดน้ำมันน้อย)
* กระเทียม ขิง และหอมแดง ช่วยลดแรงต้านหลอดเลือด

**ผลไม้รสไม่หวานจัด (ทานในปริมาณจำกัด)**
* แอปเปิ้ลเขียว ฝรั่ง หรือชมพู่ (จำกัดวันละ 1 ลูกเล็ก)

> [!WARNING]
> หลีกเลี่ยงอาหารที่มีโซเดียมสูง (เช่น บะหมี่กึ่งสำเร็จรูป ผักดอง น้ำจิ้มปริมาณมาก) และงดชา กาแฟเติมน้ำตาล นมข้นหวาน และของทอดทุกชนิดค่ะ`;
  }
  
  if (query.includes("ออกกำลัง") || query.includes("วิ่ง") || query.includes("เดิน") || query.includes("เหนื่อย")) {
    return `คำแนะนำในการออกกำลังกายอย่างปลอดภัยสำหรับคุณ:

**รูปแบบการออกกำลังกายที่แนะนำ**
* **การคาร์ดิโอเบาๆ:** เดินเร็วรอบหมู่บ้านหรือสวนสาธารณะอย่างน้อย 30 นาทีต่อวัน
* **กิจกรรมแรงกระแทกต่ำ:** โยคะยืดเหยียดร่างกาย หรือการแกว่งแขนลดพุงในบ้าน

**ความถี่และเป้าหมาย**
* ทำอย่างสม่ำเสมอให้ได้ 5 วันต่อสัปดาห์ (เป้าหมายรวม 150 นาทีต่อสัปดาห์)

> [!IMPORTANT]
> **ข้อควรระวังสำคัญ**
> * ควรวัดระดับความดันโลหิตก่อนออกกำลังกาย (หากความดันซีสโตลิกสูงเกิน 160 mmHg หรือต่ำกว่า 90 mmHg ควรพักผ่อนก่อน)
> * พกน้ำหวานหรืออมยิ้มติดตัวไว้เผื่อมีอาการใจสั่น เหงื่อออก มือสั่น จากภาวะน้ำตาลในเลือดต่ำขณะออกกำลังกายค่ะ`;
  }
  
  if (query.includes("ยา") || query.includes("ลืม") || query.includes("เม็ด")) {
    return `คำแนะนำเกี่ยวกับการรับประทานยาอย่างถูกต้องสม่ำเสมอ:

**หลักการรับประทานยา**
* รับประทานยาตามที่แพทย์สั่งอย่างเคร่งครัด ตรงเวลาทุกวัน
* ห้ามหยุดยาหรือปรับขนาดยาเองแม้ว่าค่าความดันหรือค่าน้ำตาลจะดูปกติแล้ว

**กรณีที่ลืมทานยา**
* **ยาทั่วไป:** หากนึกขึ้นได้ให้ทานทันที แต่ถ้าใกล้กับมื้อถัดไปแล้ว ให้ข้ามมื้อที่ลืมไปเลยและทานมื้อถัดไปตามปกติ (ห้ามทานยาเพิ่มเป็น 2 เท่าเด็ดขาด)

> [!IMPORTANT]
> ควรจดบันทึกประวัติการทานยาในเช็คลิสต์และตรวจสอบสิทธิ์การอนุมัติร่วมกับผู้ดูแล เพื่อให้แพทย์ได้รับข้อมูลประวัติการรักษาที่ครบถ้วนค่ะ`;
  }

  if (query.includes("ความดัน") || query.includes("น้ำตาล") || query.includes("สูง") || query.includes("วัด")) {
    return `คำแนะนำเกี่ยวกับการตรวจวัดค่าสุขภาพด้วยตนเองที่บ้าน:

**เป้าหมายการควบคุม**
* **ความดันโลหิต:** ควรต่ำกว่า 130/80 mmHg (หากสูงเกิน 140/90 mmHg ต่อเนื่องกันหลายวัน ควรปรึกษาแพทย์)
* **น้ำตาลในเลือด (หลังอดอาหาร):** 70 - 130 mg/dL
* **น้ำตาลหลังอาหาร 2 ชั่วโมง:** ต่ำกว่า 180 mg/dL

**การจดบันทึกประจำวัน**
* บันทึกค่าผ่านแอปพลิเคชันทุกเช้าและก่อนนอน เพื่อส่งข้อมูลซิงค์กับแพทย์และผู้ดูแลโดยตรง

> [!WARNING]
> หากวัดความดันโลหิตตัวบน (Systolic) ได้สูงเกิน **180 mmHg** หรือมีอาการเวียนศีรษะ ปวดท้ายทอยอย่างรุนแรง ตาพร่ามัว เจ็บหน้าอก ให้รีบนั่งพัก 5 นาทีแล้ววัดซ้ำ หากค่ายังสูงอยู่ให้ติดต่อแพทย์หรือไปห้องฉุกเฉินทันทีค่ะ`;
  }

  return `สวัสดีค่ะ ฉันคือผู้ช่วย AI ส่วนตัวด้านการดูแลสุขภาพของคุณในแอปพลิเคชันนี้ค่ะ

วันนี้ต้องการสอบถามข้อมูล หรือขอคำแนะนำในด้านใดเป็นพิเศษคะ?
* **คำแนะนำด้านอาหาร:** พิมพ์ถามเช่น "เมนูอาหารที่คนเป็นเบาหวานทานได้"
* **คำแนะนำการออกกำลังกาย:** พิมพ์ถามเช่น "ควรเดินกี่นาทีดี"
* **การวัดค่าสุขภาพหรือลืมทานยา:** พิมพ์ถามเช่น "ลืมทานยาต้องทำอย่างไร"

*(ขณะนี้ระบบกำลังให้บริการใน **โหมดออฟไลน์** เนื่องจากระบบ Cloudflare ของเครือข่ายจำกัดการเข้าถึงจากเครื่องเซิร์ฟเวอร์ภายนอก แต่คุณยังสามารถรับคำแนะนำตามแผนแพทย์ได้ตามปกติค่ะ)*`;
}
