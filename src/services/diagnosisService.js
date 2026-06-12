// ============================================================
// سنابل — خدمة التشخيص في الواجهة الأمامية
// المسار: src/services/diagnosisService.js
// تضغط الصورة قبل الإرسال (توفير توكنات + سرعة) ثم تستدعي الـ API
// ============================================================

const API_ENDPOINT = '/api/diagnose';

// الحد الأقصى لأبعاد الصورة المرسلة — 1024px كافية للتشخيص الدقيق
const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.85;

/**
 * ضغط وتصغير الصورة عبر Canvas قبل إرسالها
 * @param {File} file - ملف الصورة من input
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // تصغير الأبعاد مع الحفاظ على النسبة
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        const base64 = dataUrl.split(',')[1];

        resolve({ base64, mimeType: 'image/jpeg' });
      };

      img.onerror = () => reject(new Error('تعذر قراءة الصورة'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('تعذر فتح الملف'));
    reader.readAsDataURL(file);
  });
}

/**
 * إرسال صورة النبات للتشخيص
 * @param {File} file - ملف الصورة
 * @param {Object} options - خيارات إضافية
 * @param {string} options.cropType - نوع المحصول (اختياري، يحسّن الدقة)
 * @param {string} options.province - المحافظة (اختياري)
 * @returns {Promise<Object>} نتيجة التشخيص
 */
export async function diagnosePlant(file, options = {}) {
  // التحقق من نوع الملف
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('الرجاء اختيار صورة صالحة');
  }

  // التحقق من الحجم الأصلي (حد أقصى 10MB قبل الضغط)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير جداً، الحد الأقصى 10 ميغابايت');
  }

  // ضغط الصورة
  const { base64, mimeType } = await compressImage(file);

  // استدعاء الـ API
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64,
      mimeType,
      cropType: options.cropType || '',
      province: options.province || '',
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'فشل التشخيص، حاول مرة أخرى');
  }

  return data.diagnosis;
}

/**
 * مثال على شكل نتيجة التشخيص المُرجعة:
 * {
 *   is_plant: true,
 *   healthy: false,
 *   plant_name: "طماطة",
 *   disease_ar: "اللفحة المتأخرة",
 *   disease_en: "Late Blight",
 *   confidence: 87,
 *   severity: "متوسطة",
 *   symptoms: ["بقع بنية داكنة على الأوراق", "..."],
 *   causes: ["رطوبة عالية", "..."],
 *   treatment: ["رش مبيد مانكوزيب بمعدل ...", "..."],
 *   prevention: ["تحسين التهوية بين النباتات", "..."],
 *   urgent: false,
 *   notes: "..."
 * }
 */