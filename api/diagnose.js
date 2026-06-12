// ============================================================
// سنابل — نظام تشخيص أمراض النباتات بالذكاء الاصطناعي
// Vercel Edge Function — Gemini Vision مع Fallback تلقائي
// المسار: api/diagnose.js
// ============================================================

export const config = { runtime: 'edge' };

// الموديلات بالترتيب: إذا فشل الأول (نفاد الحصة) ينتقل للثاني تلقائياً
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

const SYSTEM_PROMPT = `أنت خبير أمراض نباتات متخصص في الزراعة العراقية، تعمل ضمن منصة "سنابل" الزراعية.

مهمتك: تحليل صورة النبات المرفقة وتشخيص حالتها بدقة.

قواعد صارمة:
1. أرجع JSON فقط، بدون أي نص قبله أو بعده، وبدون علامات Markdown مثل \`\`\`
2. كل النصوص باللغة العربية الفصحى المبسطة المفهومة للمزارع العراقي
3. في العلاج، اذكر مبيدات ومواد متوفرة فعلياً في الأسواق العراقية
4. راعِ المناخ العراقي (حرارة عالية، جفاف، ملوحة تربة) في التوصيات
5. إذا لم تكن الصورة لنبات، أرجع is_plant: false
6. كن صادقاً في نسبة الثقة — لا تبالغ

صيغة الـ JSON المطلوبة حصراً:
{
  "is_plant": true,
  "healthy": false,
  "plant_name": "اسم النبات إن أمكن تحديده",
  "disease_ar": "اسم المرض بالعربية",
  "disease_en": "Disease name in English",
  "confidence": 85,
  "severity": "خفيفة | متوسطة | شديدة",
  "symptoms": ["العرض الأول المرئي في الصورة", "العرض الثاني"],
  "causes": ["السبب المحتمل الأول", "السبب الثاني"],
  "treatment": ["خطوة العلاج الأولى بالتفصيل", "الخطوة الثانية"],
  "prevention": ["إجراء وقائي أول", "إجراء ثانٍ"],
  "urgent": false,
  "notes": "ملاحظة إضافية مهمة للمزارع إن وجدت"
}

إذا كان النبات سليماً: healthy: true مع نصائح عناية في notes.
إذا لم تكن صورة نبات: {"is_plant": false, "notes": "سبب الرفض"}`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

export default async function handler(req) {
  // معالجة طلبات CORS التمهيدية
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'الطريقة غير مدعومة، استخدم POST' }, 405);
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return jsonResponse({ error: 'مفتاح API غير مُعرّف في إعدادات الخادم' }, 500);
  }

  // قراءة بيانات الطلب
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'صيغة الطلب غير صحيحة' }, 400);
  }

  const { image, mimeType = 'image/jpeg', cropType = '', province = '' } = body;

  if (!image || typeof image !== 'string') {
    return jsonResponse({ error: 'الرجاء إرفاق صورة النبات (base64)' }, 400);
  }

  // إزالة بادئة data URL إن وجدت
  const base64Data = image.includes(',') ? image.split(',')[1] : image;

  // سياق إضافي يحسّن دقة التشخيص
  let userContext = 'حلل هذه الصورة وشخّص حالة النبات.';
  if (cropType) userContext += ` نوع المحصول حسب المزارع: ${cropType}.`;
  if (province) userContext += ` الموقع: محافظة ${province}، العراق.`;

  const requestPayload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: userContext },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  // المحاولة على الموديلات بالتسلسل (Fallback)
  let lastError = null;

  for (const model of MODELS) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      // نفاد الحصة أو ضغط الخادم → جرّب الموديل التالي
      if (response.status === 429 || response.status === 503) {
        lastError = `الموديل ${model} وصل حد الاستخدام`;
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        lastError = `خطأ من ${model}: ${response.status} — ${errText.slice(0, 200)}`;
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        lastError = 'استجابة فارغة من الموديل';
        continue;
      }

      // تنظيف وتحويل النص إلى JSON
      const cleanText = rawText.replace(/```json|```/g, '').trim();

      let diagnosis;
      try {
        diagnosis = JSON.parse(cleanText);
      } catch {
        lastError = 'فشل تحليل استجابة الموديل';
        continue;
      }

      return jsonResponse({
        success: true,
        model_used: model,
        diagnosis,
      });
    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  // فشلت كل الموديلات
  return jsonResponse(
    {
      success: false,
      error: 'الخدمة مشغولة حالياً، الرجاء المحاولة بعد قليل',
      details: lastError,
    },
    503
  );
}