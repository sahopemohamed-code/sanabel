import { useState, useEffect } from 'react'
import { calculateIrrigation } from '../lib/api'

const S = {
  card: { background:'rgba(19,42,26,.65)', border:'1px solid rgba(101,194,133,.12)', borderRadius:16, padding:18 },
  label: { display:'block', fontSize:11, fontWeight:600, color:'#65C285', marginBottom:6 },
  input: { width:'100%', background:'rgba(19,42,26,.7)', border:'1px solid rgba(101,194,133,.18)',
    borderRadius:11, padding:'10px 13px', fontFamily:'Tajawal,sans-serif',
    fontSize:13, color:'#fff', outline:'none', boxSizing:'border-box', marginBottom:14 },
}

export default function Irrigation({ showNotif }) {
  const [form, setForm] = useState({
    cropType:'حنطة', soilType:'طمي', season:'صيف', stage:'نمو خضري', area:10
  })
  const [result, setResult] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const calc = () => {
    const r = calculateIrrigation(form)
    setResult(r)
    showNotif('💧', 'تم الحساب!', `${r.daily.toLocaleString('ar')} لتر/يوم`)
  }

  return (
    <div style={{ padding: isMobile ? '16px 12px 20px' : '24px 24px 60px' }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:'#A8DFC0' }}>نظام الري الذكي 💧</div>
        <div style={{ fontSize:12, color:'#65C285', opacity:.6, marginTop:4 }}>احسب الكمية المثلى للري</div>
      </div>

      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? 16 : 20 }}>

        {/* Form */}
        <div style={S.card}>
          {[
            ['نوع المحصول','cropType',['حنطة','طماطم','خيار','نخيل','شعير','ذرة','باذنجان','بطاطا','بصل','فلفل','رقي','بطيخ','تفاح','رمان','عنب','تين','مشمش','برتقال','ليمون','فراولة','فلفل حار','كوسا','لوبياء','بازلاء','عدس','حمص','سمسم','زيتون','قطن']],
            ['نوع التربة','soilType',['طمي','طينية','رملية']],
            ['الموسم','season',['صيف','ربيع','خريف','شتاء']],
            ['مرحلة النمو','stage',['نمو خضري','بادرة','إزهار','إثمار','نضج']],
          ].map(([l,k,opts]) => (
            <div key={k}>
              <label style={S.label}>{l}</label>
              <select style={S.input} value={form[k]}
                onChange={e => setForm({...form,[k]:e.target.value})}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <label style={S.label}>
            المساحة: <span style={{ color:'#F0CC6A' }}>{form.area}</span> دونم
          </label>
          <input type="range" min="1" max="500" value={form.area}
            onChange={e => setForm({...form,area:+e.target.value})}
            style={{ width:'100%', accentColor:'#38A05F', marginBottom:16 }}/>
          <button onClick={calc}
            style={{ width:'100%', background:'linear-gradient(135deg,#38A05F,#2A6E47)',
              color:'#fff', border:'none', borderRadius:12,
              padding: isMobile ? 16 : 13,
              fontFamily:'Tajawal,sans-serif', fontSize: isMobile ? 16 : 14,
              fontWeight:700, cursor:'pointer' }}>
            💧 احسب جدول الري
          </button>
        </div>

        {/* Result */}
        <div>
          {!result ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', height: isMobile ? 150 : 220, color:'rgba(255,255,255,.2)' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>💧</div>
              <div>أدخل بيانات حقلك</div>
            </div>
          ) : (
            <div className="fade-in">
              <div style={{ ...S.card, background:'linear-gradient(135deg,rgba(19,42,26,.9),rgba(10,26,13,.9))', marginBottom:12 }}>
                <div style={{ fontSize:11, color:'#65C285', opacity:.6, marginBottom:4 }}>الكمية اليومية</div>
                <div style={{ fontSize: isMobile ? 40 : 48, fontWeight:900, color:'#A8DFC0' }}>
                  {result.daily.toLocaleString('ar')}
                </div>
                <div style={{ fontSize:13, color:'#65C285' }}>لتر / يوم</div>
                <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                  <span style={{ background:'rgba(41,128,185,.2)', color:'#60a5fa',
                    fontSize:10, padding:'3px 9px', borderRadius:7, fontWeight:700 }}>
                    توفير {result.savings}%
                  </span>
                  <span style={{ background:'rgba(56,160,95,.2)', color:'#65C285',
                    fontSize:10, padding:'3px 9px', borderRadius:7, fontWeight:700 }}>
                    ✅ {(result.daily/1000).toFixed(2)} م³
                  </span>
                </div>
              </div>

              <div style={S.card}>
                <div style={{ fontSize:10, fontWeight:700, color:'#65C285', marginBottom:10 }}>📅 جدول الأسبوع</div>
                {result.schedule.map(d => (
                  <div key={d.day} style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', background:'rgba(10,26,13,.5)',
                    borderRadius:9, padding:'9px 12px', marginBottom:6 }}>
                    <span style={{ fontSize: isMobile ? 13 : 12, color:'#A8DFC0', fontWeight:600 }}>{d.day}</span>
                    {d.skip
                      ? <span style={{ color:'#f87171', fontSize:11, fontWeight:700 }}>لا ري</span>
                      : <span style={{ color:'#F0CC6A', fontWeight:700, fontSize: isMobile ? 13 : 12 }}>
                          {d.amt.toLocaleString('ar')} لتر
                        </span>
                    }
                  </div>
                ))}
                <div style={{ background:'rgba(56,160,95,.1)', border:'1px solid rgba(56,160,95,.2)',
                  borderRadius:10, padding:11, marginTop:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#65C285', marginBottom:3 }}>💡 نصيحة</div>
                  <div style={{ fontSize: isMobile ? 12 : 11, color:'rgba(255,255,255,.7)' }}>{result.tip}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}