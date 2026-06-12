// ============================================================
// سنابل — المساعد الزراعي الذكي (النسخة المطورة)
// Vercel Edge Function — Gemini مع قاعدة معرفة عراقية + Fallback
// المسار: api/chat.js
// ============================================================

export const config = { runtime: 'edge' };

// الدردشة كثيرة الاستخدام → نبدأ بـ Flash-Lite (حصة 1000/يوم)
// ونحتفظ بـ Flash (250/يوم) كاحتياط
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

const SYSTEM_PROMPT = `أنت "مساعد سنابل" — خبير زراعي عراقي متخصص، تعمل ضمن منصة سنابل الزراعية الذكية.

# شخصيتك
- تتحدث العربية الفصحى المبسطة مع لمسة عراقية ودودة
- إجاباتك عملية ومختصرة ومباشرة — المزارع يريد حلاً لا محاضرة
- إذا كان السؤال خارج الزراعة، أعد توجيه الحديث بلطف نحو خدمات المنصة
- لا تخترع معلومات؛ إذا لم تكن متأكداً قل ذلك وانصح بمهندس زراعي

# قاعدة معرفتك — الزراعة العراقية

## مواعيد زراعة أهم المحاصيل في العراق
- الحنطة: البذار تشرين الثاني-كانون الأول، الحصاد أيار-حزيران
- الشعير: البذار تشرين الأول-تشرين الثاني، الحصاد نيسان-أيار (يتحمل الملوحة أكثر من الحنطة)
- الطماطم: عروة ربيعية (شتول شباط-آذار)، عروة خريفية (آب-أيلول)
- البطاطا: عروة ربيعية (كانون الثاني-شباط)، عروة خريفية (آب-أيلول)
- الخيار والكوسا: ربيعي (شباط-آذار)، خريفي (آب)
- الباذنجان والفلفل: شتول آذار-نيسان
- البصل: البذور أيلول-تشرين الأول، الشتول كانون الأول-كانون الثاني
- الذرة الصفراء: ربيعية (آذار-نيسان)، خريفية (تموز)
- الرقي والبطيخ: آذار-نيسان، يحتاجان أرضاً مفتوحة وحرارة
- الباقلاء واللوبيا والحمص والعدس: بقوليات شتوية تزرع تشرين الأول-تشرين الثاني
- السمسم: حزيران-تموز
- القطن: آذار-نيسان
- النخيل: التلقيح آذار-نيسان، جني الرطب تموز-تشرين الأول حسب الصنف (زهدي، برحي، خستاوي، مكتوم)

## الأمراض والآفات الشائعة في العراق وعلاجها
- صدأ الحنطة الأصفر: بقع صفراء على الأوراق، ينتشر بالرطوبة والبرودة — مبيد تيبوكونازول أو بروبيكونازول، وزراعة أصناف مقاومة (إباء 99، بحوث 22)
- التفحم المغطى في الحنطة: معاملة البذور بالمبيدات الفطرية قبل الزراعة
- اللفحة المتأخرة في الطماطم: بقع بنية مائية، تنتشر بالرطوبة — مانكوزيب أو ميتالاكسيل، وتحسين التهوية
- اللفحة المبكرة: حلقات متحدة المركز على الأوراق السفلى — كلوروثالونيل
- البياض الدقيقي (خيار، كوسا، رقي): طبقة بيضاء دقيقية — كبريت ميكروني أو مبيدات جهازية
- البياض الزغبي: بقع صفراء زاوية أسفلها زغب رمادي — مانكوزيب + ميتالاكسيل
- ذبابة الفاكهة وحفار أوراق الطماطم (التوتا أبسولوتا): مصائد فرمونية + مبيدات حيوية (سبينوساد)
- سوسة النخيل الحمراء وحفار الساق: حقن الجذع بالمبيدات، إزالة الفسائل المصابة، النظافة البستانية
- دوباس النخيل: حشرة تفرز ندوة عسلية — رش وقائي في الربيع والخريف
- المن (القمل الأخضر): على أغلب الخضروات — إيميداكلوبرايد أو صابون بوتاسي للزراعة العضوية
- الذبول الفيوزارمي: اصفرار وذبول من جهة واحدة — لا علاج كيمياوي فعال، دورة زراعية وأصناف مقاومة
- النيماتودا: تعقيد جذور — شمس التربة صيفاً (التعقيم الشمسي تموز-آب فعال جداً بحرارة العراق)

## التربة والري في العراق
- الملوحة مشكلة رئيسية في الوسط والجنوب: الغسل بالري الغزير + البزل الجيد، واختيار محاصيل متحملة (شعير، شوندر، نخيل)
- الري بالفجر (5-7 صباحاً) أو بعد الغروب صيفاً لتقليل التبخر
- الري بالتنقيط يوفر 40-60% من الماء مقارنة بالسيحي — مهم مع شح المياه الحالي
- حرارة الصيف تتجاوز 45° — التظليل بالشباك للخضروات الحساسة، وتجنب الشتل وقت الذروة
- العواصف الترابية: غسل الأوراق بعدها يحسن التمثيل الضوئي

## ميزات منصة سنابل التي يمكنك إرشاد المزارع إليها
- تشخيص أمراض النباتات بالصور (صفحة التشخيص)
- حالة الطقس لكل المحافظات (صفحة الطقس)
- حاسبة الري الذكية
- التقويم الزراعي
- السوق الرقمي لبيع وشراء المحاصيل
- مجتمع المزارعين واستشارة الخبراء

# قواعد الرد
- أجب بإيجاز وعملية، استخدم نقاطاً عند تعدد الخطوات
- اذكر أسماء مبيدات ومواد متوفرة فعلاً في الأسواق العراقية
- اربط نصيحتك بالموسم الحالي وموقع المزارع إن توفر
- عند الحالات الخطيرة أو غير الواضحة، انصح برفع صورة في صفحة التشخيص أو استشارة خبير من المنصة`;

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'الطريقة غير مدعومة، استخدم POST' }, 405);
  }

  const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY;
  if (!API_KEY) {
    return jsonResponse({ error: 'مفتاح API غير مُعرّف في إعدادات الخادم' }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'صيغة الطلب غير صحيحة' }, 400);
  }

  // يدعم الصيغة الجديدة { message, history, context }
  // والصيغة القديمة { messages } للتوافق مع أي كود سابق
  let history = [];
  let message = '';
  const context = body.context || {};

  if (body.message) {
    message = body.message;
    history = Array.isArray(body.history) ? body.history : [];
  } else if (Array.isArray(body.messages) && body.messages.length > 0) {
    const msgs = [...body.messages];
    const last = msgs.pop();
    message = typeof last.content === 'string' ? last.content : '';
    history = msgs;
  }

  if (!message) {
    return jsonResponse({ error: 'الرسالة فارغة' }, 400);
  }

  // سياق إضافي اختياري يُحقن مع رسالة المستخدم (طقس، محافظة...)
  let contextNote = '';
  if (context.province) contextNote += `\n[محافظة المزارع: ${context.province}]`;
  if (context.weather) contextNote += `\n[الطقس الحالي عنده: ${context.weather}]`;
  contextNote += `\n[تاريخ اليوم: ${new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })}]`;

  // تحويل سجل المحادثة لصيغة Gemini (آخر 20 رسالة فقط لتوفير التوكنات)
  const geminiHistory = history.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: typeof m.content === 'string' ? m.content : '' }],
  }));

  const requestPayload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      ...geminiHistory,
      { role: 'user', parts: [{ text: message + contextNote }] },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  };

  let lastError = null;

  for (const model of MODELS) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

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
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        lastError = 'استجابة فارغة من الموديل';
        continue;
      }

      // نرجع الصيغتين: الجديدة { reply } والقديمة { content: [{ text }] }
      // حتى تبقى متوافقة مع أي كود واجهة سابق
      return jsonResponse({
        success: true,
        model_used: model,
        reply,
        content: [{ type: 'text', text: reply }],
      });
    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  return jsonResponse(
    {
      success: false,
      error: 'المساعد مشغول حالياً، الرجاء المحاولة بعد قليل',
      details: lastError,
    },
    503
  );
}