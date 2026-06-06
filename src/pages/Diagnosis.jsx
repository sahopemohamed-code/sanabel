import { useState } from 'react'
import { diagnosePlant } from '../lib/api'
import { supabase } from '../lib/supabase'

const DB = {
  rust: {
    badge:'🦠 صدأ أصفر', color:'#ef4444',
    name:'الصدأ الأصفر — Puccinia striiformis',
    conf:92,
    steps:['رش مبيد فطري خلال 24 ساعة','عزل النباتات المصابة','قلل الرطوبة','تابع كل 3 أيام'],
    meds:['Tebuconazole','Propiconazole','مانكوزيب 80%']
  },
  blight: {
    badge:'🍅 لفحة مبكرة', color:'#f97316',
    name:'اللفحة المبكرة — Alternaria solani',
    conf:88,
    steps:['أزل الأوراق المصابة','رش كبريت + نحاس','قلل الري','عالج التربة'],
    meds:['Chlorothalonil','Mancozeb 75%','نحاس هيدروكسيد']
  },
  healthy: {
    badge:'✅ نبات سليم', color:'#22c55e',
    name:'النبات بصحة ممتازة',
    conf:97,
    steps:['لا أمراض مكتشفة','اللون طبيعي','معدل النمو سليم','استمر بالعناية'],
    meds:['لا علاج مطلوب']
  }
}

const S = {
  card: { background:'rgba(19,42,26,.65)', border:'1px solid rgba(101,194,133,.12)',
    borderRadius:16, padding:18, marginBottom:12 },
  sec: { fontSize:11, fontWeight:700, color:'#65C285', letterSpacing:2,
    marginBottom:14, display:'flex', alignItems:'center', gap:7 },
}

export default function Diagnosis({ showNotif }) {
  const [preview,  setPreview]  = useState(null)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [conf,     setConf]     = useState(0)

  const runDiag = (type) => {
    setLoading(true); setResult(null); setConf(0)
    setTimeout(() => {
      const d = DB[type]; let c = 0
      const t = setInterval(() => {
        c += 2; setConf(c)
        if (c >= d.conf) { clearInterval(t); setConf(d.conf) }
      }, 18)
      setResult(d); setLoading(false)
      supabase.from('diagnoses').insert({
        disease_name: d.name, confidence: d.conf,
        is_healthy: type === 'healthy'
      })
      showNotif('🔬', 'تشخيص مكتمل!', d.name.split('—')[0])
    }, 2000)
  }

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return
    const r = new FileReader()
    r.onload = ev => { setPreview(ev.target.result); setResult(null) }
    r.readAsDataURL(f)
  }

  return (
    <div style={{ padding:'24px 24px 60px' }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:700, color:'#A8DFC0' }}>تشخيص الأمراض 🔬</div>
        <div style={{ fontSize:12, color:'#65C285', opacity:.6, marginTop:4 }}>
          ارفع صورة النبات للحصول على تشخيص فوري
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* Upload */}
        <div>
          <div style={S.sec}><div style={{ width:3,height:14,background:'#38A05F',borderRadius:2 }}/>رفع صورة</div>
          <div style={{ border:'2px dashed rgba(101,194,133,.3)', borderRadius:18,
            padding:36, textAlign:'center', cursor:'pointer',
            background:'rgba(19,42,26,.3)', position:'relative', marginBottom:14 }}
            onClick={() => document.getElementById('fi').click()}>
            <input id="fi" type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
            {preview ? (
              <img src={preview} style={{ width:'100%', maxHeight:180,
                objectFit:'cover', borderRadius:10 }}/>
            ) : (
              <>
                <div style={{ fontSize:40, marginBottom:10 }}>📸</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#A8DFC0' }}>صوّر النبات</div>
                <div style={{ fontSize:11, color:'#65C285', opacity:.5, marginTop:4 }}>اضغط لرفع صورة</div>
              </>
            )}
          </div>

          {preview && (
            <button onClick={() => runDiag('rust')}
              style={{ width:'100%', background:'linear-gradient(135deg,#38A05F,#2A6E47)',
                color:'#fff', border:'none', borderRadius:12, padding:13,
                fontFamily:'Tajawal,sans-serif', fontSize:14, fontWeight:700,
                cursor:'pointer', marginBottom:16 }}>
              🔬 تشخيص الآن
            </button>
          )}

          <div style={{ fontSize:11, color:'#65C285', opacity:.5, marginBottom:10 }}>أمثلة تجريبية:</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[['rust','🌾','صدأ'],['blight','🍅','لفحة'],['healthy','🌿','سليم']].map(([k,e,l]) => (
              <div key={k} style={{ ...S.card, padding:12, textAlign:'center', cursor:'pointer' }}
                onClick={() => { setPreview(k); runDiag(k) }}>
                <div style={{ fontSize:22, marginBottom:5 }}>{e}</div>
                <div style={{ fontSize:10, color:'#A8DFC0', fontWeight:700 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <div>
          <div style={S.sec}><div style={{ width:3,height:14,background:'#38A05F',borderRadius:2 }}/>نتيجة التشخيص</div>

          {!result && !loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', height:200, color:'rgba(255,255,255,.2)' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>🔬</div>
              <div>ارفع صورة لبدء التشخيص</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign:'center', padding:40 }}>
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:14 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:10, height:10, background:'#38A05F',
                    borderRadius:'50%', animation:`bounce .7s infinite`,
                    animationDelay: i*.15+'s' }}/>
                ))}
              </div>
              <div style={{ color:'#65C285', fontWeight:600 }}>جاري التحليل...</div>
            </div>
          )}

          {result && (
            <div className="fade-in">
              <div style={S.card}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:7,
                  background:'rgba(0,0,0,.2)', borderRadius:8, padding:'4px 10px',
                  fontSize:11, fontWeight:700, color:result.color,
                  marginBottom:10, border:`1px solid ${result.color}40` }}>
                  {result.badge}
                </div>
                <div style={{ fontSize:15, fontWeight:800, marginBottom:12 }}>{result.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:10, color:'#65C285', whiteSpace:'nowrap' }}>الدقة:</span>
                  <div style={{ flex:1, height:7, background:'rgba(255,255,255,.08)',
                    borderRadius:4, overflow:'hidden' }}>
                    <div style={{ width:conf+'%', height:'100%',
                      background:'linear-gradient(to left,#38A05F,#D4A832)',
                      borderRadius:4, transition:'width .05s' }}/>
                  </div>
                  <span style={{ fontSize:13, fontWeight:900, color:'#F0CC6A' }}>{conf}%</span>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={S.card}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#65C285', marginBottom:8 }}>💊 خطة العلاج</div>
                  {result.steps.map(s => (
                    <div key={s} style={{ display:'flex', gap:6, marginBottom:6 }}>
                      <div style={{ width:5, height:5, background:'#38A05F',
                        borderRadius:'50%', marginTop:5, flexShrink:0 }}/>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,.78)' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#65C285', marginBottom:8 }}>💉 الأدوية</div>
                  {result.meds.map(m => (
                    <div key={m} style={{ background:'rgba(56,160,95,.15)',
                      border:'1px solid rgba(56,160,95,.25)', color:'#65C285',
                      fontSize:10, padding:'4px 10px', borderRadius:8,
                      fontWeight:600, marginBottom:5, display:'inline-block', marginLeft:5 }}>
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* ⚠️ تنبيه التشخيص — مضاف */}
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'rgba(212,168,50,.1)',
                border: '1px solid rgba(212,168,50,.35)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{
                  fontSize: 11,
                  color: '#F0CC6A',
                  lineHeight: 1.7,
                  fontWeight: 600
                }}>
                  تنبيه: هذا التشخيص للإرشاد فقط — استشر مهندساً زراعياً للتأكيد
                </span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}