import { useState, useRef, useEffect } from 'react'
import { askAssistant } from '../lib/api'

// ============================================================
// سنابل — المساعد الزراعي الذكي (واجهة موبايل أولاً)
// مبنية بنفس أسلوب صفحة التشخيص — مرنة لكل أحجام الشاشات
// ============================================================

const QUICK = [
  'ما أعراض صدأ الحنطة؟',
  'متى أزرع الطماطم؟',
  'كيف أوفر مياه الري؟',
  'نخلتي عليها مادة دبقة، شنو الحل؟',
]

export default function Assistant({ showNotif }) {
  const [msgs, setMsgs] = useState([
    { r: 'bot', t: 'مرحباً! 🌾 أنا مساعدك الزراعي الذكي.\n\nاسألني عن زراعتك — المحاصيل، الأمراض، الري، التسميد!' },
  ])
  const [inp, setInp] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  const send = async (text) => {
    const msg = (text || inp).trim()
    if (!msg || loading) return
    setInp('')
    setMsgs((m) => [...m, { r: 'user', t: msg }])
    setLoading(true)
    try {
      const history = msgs.map((m) => ({
        role: m.r === 'bot' ? 'assistant' : 'user',
        content: m.t,
      }))
      const res = await askAssistant(msg, history)
      setMsgs((m) => [
        ...m,
        { r: 'bot', t: res.success ? res.message : 'عذراً، حدث خطأ. حاول مرة أخرى.' },
      ])
    } catch {
      setMsgs((m) => [...m, { r: 'bot', t: 'حدث خطأ، يرجى المحاولة مجدداً.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="flex flex-col bg-[#0d1a0f] text-emerald-50
                 h-[calc(100dvh-116px)] lg:h-[calc(100dvh-60px)]
                 px-3 pt-3 pb-2 lg:px-6 lg:pt-5"
    >
      <div className="flex flex-col flex-1 min-h-0 w-full max-w-2xl mx-auto">

        {/* ===== العنوان ===== */}
        <header className="mb-2.5 shrink-0">
          <h1 className="text-lg lg:text-xl font-bold text-emerald-300">المساعد الذكي 🤖</h1>
          <p className="text-xs text-emerald-200/50 mt-0.5">اسألني بالعربية أو العامية العراقية</p>
        </header>

        {/* ===== أسئلة سريعة ===== */}
        <div className="flex gap-2 mb-2.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="shrink-0 whitespace-nowrap rounded-xl border border-emerald-700/30
                         bg-[#13231a] px-3 py-2 text-xs text-emerald-300
                         active:scale-95 transition disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* ===== منطقة المحادثة ===== */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl
                        bg-[#13231a]/60 border border-emerald-800/40 p-3 lg:p-4">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 mb-3 ${m.r === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* الصورة الرمزية */}
              <div
                className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-base
                  ${m.r === 'bot' ? 'bg-emerald-900' : 'bg-emerald-600'}`}
              >
                {m.r === 'bot' ? '🌾' : '👨‍🌾'}
              </div>

              {/* فقاعة الرسالة */}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                  ${m.r === 'bot'
                    ? 'bg-[#16271a] border border-emerald-800/40 text-emerald-50/90 rounded-tr-md'
                    : 'bg-emerald-600/25 border border-emerald-500/30 text-emerald-100 rounded-tl-md'
                  }`}
              >
                {m.t}
              </div>
            </div>
          ))}

          {/* مؤشر "يكتب..." */}
          {loading && (
            <div className="flex items-start gap-2 mb-3">
              <div className="shrink-0 h-8 w-8 rounded-full bg-emerald-900 flex items-center justify-center text-base">
                🌾
              </div>
              <div className="rounded-2xl rounded-tr-md bg-[#16271a] border border-emerald-800/40 px-4 py-3 flex gap-1.5 items-center">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* ===== خانة الكتابة ===== */}
        <div className="flex gap-2 mt-2.5 shrink-0">
          <input
            value={inp}
            onChange={(e) => setInp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="اسألني عن زراعتك..."
            className="flex-1 min-w-0 rounded-xl bg-[#13231a] border border-emerald-700/40
                       px-4 py-3 text-sm text-emerald-50 placeholder:text-emerald-200/40
                       focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => send()}
            disabled={loading || !inp.trim()}
            className="shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700
                       px-5 py-3 text-sm font-bold text-white
                       active:scale-95 transition disabled:opacity-40"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  )
}