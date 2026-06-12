import { useState, useRef } from 'react'
import { diagnosePlant } from '../lib/api'

// ============================================================
// سنابل — صفحة تشخيص الأمراض (نظام Gemini الجديد)
// ترفع صورة → تضغطها → ترسلها → تعرض تشخيصاً كاملاً
// ============================================================

const CROPS = [
  '', 'حنطة', 'شعير', 'طماطم', 'خيار', 'باذنجان', 'بطاطا', 'بصل',
  'فلفل', 'نخيل', 'ذرة', 'رقي', 'بطيخ', 'كوسا', 'عنب', 'رمان',
  'تفاح', 'برتقال', 'ليمون', 'زيتون', 'فراولة', 'قطن', 'محصول آخر'
]

const PROVINCES = [
  '', 'الأنبار', 'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء',
  'بابل', 'ديالى', 'ذي قار', 'السليمانية', 'صلاح الدين', 'القادسية',
  'كركوك', 'واسط', 'ميسان', 'المثنى', 'دهوك'
]

// ضغط الصورة قبل الإرسال — يوفر بيانات المزارع ويسرّع التشخيص
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        const MAX = 1024
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width); width = MAX
          } else {
            width = Math.round((width * MAX) / height); height = MAX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => reject(new Error('تعذر قراءة الصورة'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('تعذر فتح الملف'))
    reader.readAsDataURL(file)
  })
}

export default function DiseaseDetection() {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [cropType, setCropType] = useState('')
  const [province, setProvince] = useState('')
  const fileRef = useRef(null)

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      setError('الرجاء اختيار صورة صالحة')
      return
    }
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const dataUrl = await compressImage(file)
      setPreview(dataUrl)

      const res = await diagnosePlant(dataUrl, { cropType, province })

      if (!res.success) {
        setError(res.error || 'فشل التشخيص، حاول مرة أخرى')
      } else {
        setResult(res.data)
      }
    } catch (e) {
      setError(e.message || 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const severityColor = {
    'خفيفة': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'متوسطة': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    'شديدة': 'bg-red-500/20 text-red-400 border-red-500/40',
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#0d1a0f] text-emerald-50 px-4 py-6 pb-28">
      <div className="max-w-lg mx-auto space-y-5">

        {/* ===== العنوان ===== */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-emerald-300">🔬 تشخيص الأمراض</h1>
          <p className="text-sm text-emerald-200/60">
            ارفع صورة النبات واحصل على تشخيص ذكي بخطة علاج كاملة
          </p>
        </header>

        {/* ===== خيارات تحسين الدقة ===== */}
        {!result && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-emerald-200/70 mb-1">نوع المحصول (اختياري)</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full rounded-xl bg-[#16271a] border border-emerald-800/60 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>{c || 'غير محدد'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-emerald-200/70 mb-1">المحافظة (اختياري)</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full rounded-xl bg-[#16271a] border border-emerald-800/60 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p || 'غير محددة'}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ===== منطقة رفع الصورة ===== */}
        {!result && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="w-full rounded-2xl border-2 border-dashed border-emerald-600/50 bg-[#13231663] hover:bg-[#16271a] transition p-8 flex flex-col items-center gap-3 disabled:opacity-60"
          >
            {preview ? (
              <img src={preview} alt="معاينة" className="max-h-56 rounded-xl object-contain" />
            ) : (
              <>
                <span className="text-5xl">📸</span>
                <span className="font-semibold text-emerald-200">صوّر النبات</span>
                <span className="text-xs text-emerald-200/50">اضغط لرفع صورة أو التقاطها بالكاميرا</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {/* ===== حالة التحميل ===== */}
        {loading && (
          <div className="rounded-2xl bg-[#16271a] border border-emerald-800/60 p-6 text-center space-y-3">
            <div className="mx-auto h-10 w-10 rounded-full border-4 border-emerald-700 border-t-emerald-300 animate-spin" />
            <p className="text-sm text-emerald-200/80">جاري تحليل الصورة بالذكاء الاصطناعي...</p>
            <p className="text-xs text-emerald-200/50">قد يستغرق التشخيص 5-15 ثانية</p>
          </div>
        )}

        {/* ===== رسالة خطأ ===== */}
        {error && (
          <div className="rounded-2xl bg-red-950/40 border border-red-700/50 p-4 text-center space-y-2">
            <p className="text-red-300 text-sm">⚠️ {error}</p>
            <button onClick={reset} className="text-xs text-red-200 underline">حاول مرة أخرى</button>
          </div>
        )}

        {/* ===== النتيجة ===== */}
        {result && !loading && (
          <div className="space-y-4">

            {/* الصورة المفحوصة */}
            {preview && (
              <img src={preview} alt="الصورة المفحوصة" className="w-full max-h-52 object-cover rounded-2xl border border-emerald-800/60" />
            )}

            {/* ليست صورة نبات */}
            {result.is_plant === false && (
              <div className="rounded-2xl bg-amber-950/40 border border-amber-700/50 p-5 text-center space-y-2">
                <span className="text-3xl">🤔</span>
                <p className="text-amber-200 font-semibold">لم نتعرف على نبات في الصورة</p>
                {result.notes && <p className="text-sm text-amber-200/70">{result.notes}</p>}
              </div>
            )}

            {/* نبات سليم */}
            {result.is_plant !== false && result.healthy && (
              <div className="rounded-2xl bg-emerald-950/60 border border-emerald-600/50 p-5 text-center space-y-2">
                <span className="text-4xl">✅</span>
                <p className="text-emerald-300 font-bold text-lg">
                  {result.plant_name ? `${result.plant_name} — ` : ''}النبات سليم!
                </p>
                {result.notes && <p className="text-sm text-emerald-200/80">{result.notes}</p>}
              </div>
            )}

            {/* نبات مصاب */}
            {result.is_plant !== false && !result.healthy && (
              <>
                {/* تنبيه طارئ */}
                {result.urgent && (
                  <div className="rounded-xl bg-red-950/60 border border-red-500/60 p-3 flex items-center gap-2 animate-pulse">
                    <span className="text-xl">🚨</span>
                    <p className="text-red-300 text-sm font-semibold">حالة طارئة — يُنصح بالتدخل الفوري</p>
                  </div>
                )}

                {/* بطاقة المرض */}
                <div className="rounded-2xl bg-[#16271a] border border-emerald-800/60 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {result.plant_name && (
                        <p className="text-xs text-emerald-200/60 mb-0.5">🌱 {result.plant_name}</p>
                      )}
                      <h2 className="text-xl font-bold text-emerald-100">{result.disease_ar}</h2>
                      {result.disease_en && (
                        <p className="text-xs text-emerald-200/50 mt-0.5" dir="ltr">{result.disease_en}</p>
                      )}
                    </div>
                    {result.severity && (
                      <span className={`shrink-0 text-xs px-3 py-1 rounded-full border ${severityColor[result.severity] || severityColor['متوسطة']}`}>
                        {result.severity}
                      </span>
                    )}
                  </div>

                  {/* شريط نسبة الثقة */}
                  {typeof result.confidence === 'number' && (
                    <div>
                      <div className="flex justify-between text-xs text-emerald-200/70 mb-1">
                        <span>نسبة الثقة بالتشخيص</span>
                        <span className="font-bold text-emerald-300">{result.confidence}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-emerald-950 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-emerald-600 transition-all duration-700"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* الأعراض */}
                {result.symptoms?.length > 0 && (
                  <Section icon="🔍" title="الأعراض المكتشفة">
                    <ul className="space-y-1.5">
                      {result.symptoms.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-emerald-100/90">
                          <span className="text-emerald-500 shrink-0">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* الأسباب */}
                {result.causes?.length > 0 && (
                  <Section icon="❓" title="الأسباب المحتملة">
                    <ul className="space-y-1.5">
                      {result.causes.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-emerald-100/90">
                          <span className="text-emerald-500 shrink-0">•</span>{c}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* خطة العلاج */}
                {result.treatment?.length > 0 && (
                  <Section icon="💊" title="خطة العلاج" highlight>
                    <ol className="space-y-2.5">
                      {result.treatment.map((t, i) => (
                        <li key={i} className="flex gap-3 text-sm text-emerald-100">
                          <span className="shrink-0 h-6 w-6 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-300">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{t}</span>
                        </li>
                      ))}
                    </ol>
                  </Section>
                )}

                {/* الوقاية */}
                {result.prevention?.length > 0 && (
                  <Section icon="🛡️" title="الوقاية مستقبلاً">
                    <ul className="space-y-1.5">
                      {result.prevention.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-emerald-100/90">
                          <span className="text-emerald-500 shrink-0">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* ملاحظات */}
                {result.notes && (
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/40 p-3">
                    <p className="text-xs text-emerald-200/70">💡 {result.notes}</p>
                  </div>
                )}
              </>
            )}

            {/* زر تشخيص جديد */}
            <button
              onClick={reset}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 transition text-white font-semibold py-3"
            >
              🔄 تشخيص صورة جديدة
            </button>

            <p className="text-center text-[11px] text-emerald-200/40">
              التشخيص استرشادي بالذكاء الاصطناعي — للحالات الحرجة استشر مهندساً زراعياً
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// بطاقة قسم قابلة لإعادة الاستخدام
function Section({ icon, title, highlight, children }) {
  return (
    <div className={`rounded-2xl p-4 border ${
      highlight
        ? 'bg-emerald-900/30 border-emerald-600/50'
        : 'bg-[#16271a] border-emerald-800/60'
    }`}>
      <h3 className="font-bold text-emerald-300 mb-3 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  )
}