import { useState, useEffect } from 'react'

const DATA = {
  'يناير': [
    {i:'🌱',t:'زراعة القمح والشعير',c:'#22c55e'},
    {i:'🌱',t:'زراعة البازلاء والعدس والحمص',c:'#22c55e'},
    {i:'🍓',t:'زراعة الفراولة',c:'#22c55e'},
    {i:'🧅',t:'زراعة البصل',c:'#22c55e'},
    {i:'💊',t:'تسميد الشتلات الشتوية',c:'#e8b84b'},
    {i:'🍊',t:'متابعة البرتقال والليمون',c:'#e8b84b'},
  ],
  'فبراير':[
    {i:'💧',t:'ري كثيف للحنطة والشعير',c:'#3b82f6'},
    {i:'🔬',t:'فحص دوري للمحاصيل الشتوية',c:'#06b6d4'},
    {i:'🥔',t:'زراعة البطاطا الربيعية',c:'#22c55e'},
    {i:'🍓',t:'متابعة الفراولة وريها',c:'#3b82f6'},
    {i:'🌹',t:'زراعة المشمش والرمان',c:'#22c55e'},
  ],
  'مارس':[
    {i:'🌱',t:'زراعة الطماطم المبكرة',c:'#22c55e'},
    {i:'🥒',t:'زراعة الخيار والكوسا',c:'#22c55e'},
    {i:'🍇',t:'زراعة العنب والتين',c:'#22c55e'},
    {i:'🐛',t:'رش مبيد للحشرات',c:'#a855f7'},
    {i:'🍓',t:'حصاد الفراولة المبكر',c:'#e8b84b'},
    {i:'🌱',t:'زراعة اللوبياء',c:'#22c55e'},
  ],
  'أبريل':[
    {i:'💧',t:'زيادة الري — الحرارة ترتفع',c:'#3b82f6'},
    {i:'🌱',t:'زراعة الخيار والفلفل والباذنجان',c:'#22c55e'},
    {i:'🍉',t:'زراعة الرقي والبطيخ',c:'#22c55e'},
    {i:'🌽',t:'تجهيز أرض الذرة',c:'#22c55e'},
    {i:'🍅',t:'شتل الطماطم في الحقل',c:'#22c55e'},
    {i:'💊',t:'تسميد محاصيل الربيع',c:'#e8b84b'},
  ],
  'مايو':[
    {i:'🌾',t:'حصاد الحنطة المبكر',c:'#e8b84b'},
    {i:'🌾',t:'حصاد الشعير',c:'#e8b84b'},
    {i:'🍅',t:'قطف الطماطم المبكرة',c:'#e8b84b'},
    {i:'🍓',t:'نهاية موسم الفراولة',c:'#e8b84b'},
    {i:'🌽',t:'زراعة الذرة الصيفي',c:'#22c55e'},
    {i:'🐛',t:'رش مبيد للذبابة البيضاء',c:'#a855f7'},
  ],
  'يونيو':[
    {i:'🌡️',t:'موجة حر — لا ري ظهراً',c:'#ef4444'},
    {i:'🌴',t:'تلقيح النخيل ومتابعته',c:'#22c55e'},
    {i:'🍉',t:'متابعة الرقي والبطيخ',c:'#3b82f6'},
    {i:'🥒',t:'حصاد الخيار والكوسا',c:'#e8b84b'},
    {i:'🫑',t:'حصاد الفلفل الأخضر',c:'#e8b84b'},
    {i:'🌿',t:'زراعة السمسم',c:'#22c55e'},
  ],
  'يوليو':[
    {i:'⚠️',t:'درجات عالية — رش تبريد',c:'#ef4444'},
    {i:'🌽',t:'متابعة الذرة وريها',c:'#3b82f6'},
    {i:'🍆',t:'حصاد الباذنجان',c:'#e8b84b'},
    {i:'🍅',t:'ذروة إنتاج الطماطم',c:'#e8b84b'},
    {i:'🍉',t:'حصاد الرقي والبطيخ',c:'#e8b84b'},
    {i:'🌿',t:'متابعة القطن',c:'#22c55e'},
  ],
  'أغسطس':[
    {i:'🌴',t:'حصاد التمر — زهدي وغيره',c:'#e8b84b'},
    {i:'🌽',t:'حصاد الذرة الصيفي',c:'#e8b84b'},
    {i:'🌿',t:'حصاد السمسم',c:'#e8b84b'},
    {i:'💊',t:'تسميد خريفي للأشجار',c:'#e8b84b'},
    {i:'🍇',t:'حصاد العنب',c:'#e8b84b'},
    {i:'🍎',t:'متابعة التفاح والمشمش',c:'#3b82f6'},
  ],
  'سبتمبر':[
    {i:'🌱',t:'تجهيز الأرض للموسم الخريفي',c:'#22c55e'},
    {i:'💧',t:'تقليل الري تدريجياً',c:'#3b82f6'},
    {i:'🍅',t:'زراعة الطماطم الخريفية',c:'#22c55e'},
    {i:'🥒',t:'زراعة الخيار الخريفي',c:'#22c55e'},
    {i:'🫒',t:'متابعة الزيتون قبل الحصاد',c:'#3b82f6'},
    {i:'🌿',t:'حصاد القطن',c:'#e8b84b'},
  ],
  'أكتوبر':[
    {i:'🌾',t:'زراعة الشعير الشتوي',c:'#22c55e'},
    {i:'🥔',t:'زراعة البطاطا الخريفية',c:'#22c55e'},
    {i:'🧅',t:'زراعة البصل الشتوي',c:'#22c55e'},
    {i:'🫒',t:'حصاد الزيتون',c:'#e8b84b'},
    {i:'🍎',t:'حصاد التفاح والرمان',c:'#e8b84b'},
    {i:'💊',t:'تسميد محاصيل الشتاء',c:'#e8b84b'},
  ],
  'نوفمبر':[
    {i:'🌱',t:'زراعة الحنطة الشتوية',c:'#22c55e'},
    {i:'🌱',t:'زراعة العدس والحمص والبازلاء',c:'#22c55e'},
    {i:'🍊',t:'زراعة البرتقال والليمون',c:'#22c55e'},
    {i:'💊',t:'تسميد الأشجار المثمرة',c:'#e8b84b'},
    {i:'🔬',t:'فحص التربة قبل الشتاء',c:'#06b6d4'},
    {i:'🍓',t:'زراعة الفراولة الشتوية',c:'#22c55e'},
  ],
  'ديسمبر':[
    {i:'❄️',t:'حماية المحاصيل من الصقيع',c:'#ef4444'},
    {i:'🌱',t:'متابعة الحنطة والشعير',c:'#22c55e'},
    {i:'💧',t:'ري خفيف للمحاصيل الشتوية',c:'#3b82f6'},
    {i:'🍊',t:'حصاد البرتقال والليمون',c:'#e8b84b'},
    {i:'🌴',t:'صيانة وتقليم النخيل',c:'#22c55e'},
    {i:'💊',t:'تسميد الشتلات الشتوية',c:'#e8b84b'},
  ],
}

const MONTHS = Object.keys(DATA)
const DAYS = ['ح','ن','ث','ر','خ','ج','س']

export default function Calendar() {
  const curMonth = new Date().toLocaleString('ar',{month:'long'})
  const [selected, setSelected] = useState(MONTHS.find(m=>m===curMonth)||MONTHS[3])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const firstDay = 2
  const total = 30
  const eventsInMonth = [{d:21,i:'💊',t:'تسميد النخيل'},{d:23,i:'💧',t:'ري دوري'},{d:25,i:'🔬',t:'فحص الطماطم'},{d:28,i:'🌱',t:'بذر الخيار'}]

  return (
    <div style={{ padding: isMobile ? '16px 12px 20px' : '24px 24px 60px' }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:'#A8DFC0' }}>التقويم الزراعي 📅</div>
        <div style={{ fontSize:12, color:'#65C285', opacity:.6, marginTop:4 }}>مواعيد الزراعة والعناية — 29 محصول</div>
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
        {MONTHS.map(m => (
          <button key={m} onClick={() => setSelected(m)}
            style={{ padding: isMobile ? '7px 10px' : '6px 12px',
              borderRadius:10, fontSize: isMobile ? 12 : 11, fontWeight:700,
              fontFamily:'Tajawal,sans-serif', cursor:'pointer', border:'none',
              background: selected===m ? '#38A05F' : 'rgba(19,42,26,.6)',
              color: selected===m ? '#fff' : '#65C285' }}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? 14 : 18 }}>

        {!isMobile && (
          <div style={{ background:'rgba(19,42,26,.65)', border:'1px solid rgba(101,194,133,.12)', borderRadius:16, padding:18 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:8 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:9, fontWeight:700,
                  color:'#65C285', opacity:.5, padding:3 }}>{d}</div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
              {[...Array(firstDay)].map((_,i) => <div key={i}/>)}
              {[...Array(total)].map((_,i) => {
                const d = i+1
                const ev = eventsInMonth.find(e => e.d===d)
                const today = d===21
                return (
                  <div key={d} style={{ textAlign:'center', padding:'5px 2px',
                    borderRadius:6, cursor:'pointer',
                    background: today?'#38A05F':ev?'rgba(56,160,95,.2)':'transparent',
                    border:`1px solid ${today?'#38A05F':ev?'rgba(101,194,133,.3)':'rgba(101,194,133,.07)'}`,
                    fontSize:10, color: today?'#fff':'#A8DFC0',
                    fontWeight: today?800:400 }}>
                    {d}
                    {ev && <div style={{ fontSize:7, marginTop:1 }}>{ev.i}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#65C285',
            letterSpacing:2, marginBottom:12, display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:3, height:14, background:'#38A05F', borderRadius:2 }}/>
            نشاطات {selected}
          </div>
          <div style={{ maxHeight: isMobile ? 'none' : 320, overflowY: isMobile ? 'visible' : 'auto' }}>
            {DATA[selected].map((e,i) => (
              <div key={i} style={{ background:'rgba(19,42,26,.4)',
                borderRadius:12, padding: isMobile ? '12px 14px' : '11px 13px',
                display:'flex', alignItems:'center', gap:10,
                borderRight:`3px solid ${e.c}`, marginBottom:9 }}>
                <span style={{ fontSize: isMobile ? 22 : 18 }}>{e.i}</span>
                <div>
                  <div style={{ fontSize: isMobile ? 13 : 12, fontWeight:700, color:'#A8DFC0' }}>{e.t}</div>
                  <div style={{ fontSize:9, color:'#65C285', marginTop:2 }}>{selected} 2026</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:'rgba(19,42,26,.65)', border:'1px solid rgba(101,194,133,.12)',
            borderRadius:14, padding:14, marginTop:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#65C285', marginBottom:10 }}>دليل الألوان</div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gap:6 }}>
              {[['#22c55e','زراعة'],['#3b82f6','ري'],['#e8b84b','حصاد/تسميد'],['#ef4444','تحذير'],['#a855f7','مكافحة'],['#06b6d4','فحص']].map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:c, flexShrink:0 }}/>
                  <span style={{ fontSize:11, color:'#A8DFC0' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}