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
    return {
      configured: true,
      model: targetModel,
      text: text || JSON.stringify(payload)
    };
  } catch (error) {
    const err = error as any;
    if (err.response) {
      if (err.response.statusCode === 403) {
        const errorBody = err.response.body;
        if (errorBody && typeof errorBody === "object" && (errorBody as any).detail) {
          throw new Error(`SWU AI: ${(errorBody as any).detail}`);
        }
        throw new Error("ติดระบบป้องกันของ Cloudflare (403) - กรุณาเชื่อมต่อ SWU VPN หรือตรวจสอบสิทธิ์การเข้าถึง");
      }
      throw new Error(`SWU chat request failed: ${error.response.statusCode} ${JSON.stringify(error.response.body)}`);
    }
    throw new Error(`SWU chat request failed: ${error.message}`);
  }
}
