import { useState, useRef, useEffect } from 'react'
import { askAssistant } from '../lib/api'

const QUICK = ['ما أعراض صدأ الحنطة؟','متى أحصد الطماطم؟','كيف أوفر مياه الري؟','ما أفضل سماد للحنطة؟']

export default function Assistant({ showNotif }) {
  const [msgs, setMsgs]     = useState([{r:'bot',t:'مرحباً! 🌾 أنا مساعدك الزراعي الذكي.\n\nاسألني عن زراعتك — المحاصيل، الأمراض، الري، التسميد!'}])
  const [inp,  setInp]      = useState('')
  const [loading, setLoad]  = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const send = async (text) => {
    const msg = text || inp.trim()
    if (!msg || loading) return
    setInp('')
    setMsgs(m => [...m, { r:'user', t:msg }])
    setLoad(true)
    try {
      const history = msgs.map(m => ({ role: m.r==='bot'?'assistant':'user', content: m.t }))
      const res = await askAssistant(msg, history)
      setMsgs(m => [...m, { r:'bot', t: res.success ? res.message : 'عذراً، حدث خطأ. حاول مرة أخرى.' }])
    } catch {
      setMsgs(m => [...m, { r:'bot', t:'حدث خطأ، يرجى المحاولة مجدداً.' }])
    } finally {
      setLoad(false)
    }
  }

  return (
    <div style={{ padding:'24px 24px 20px', display:'flex', flexDirection:'column',
      height:'calc(100vh - 60px)' }}>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:22, fontWeight:700, color:'#A8DFC0' }}>المساعد الذكي 🤖</div>
        <div style={{ fontSize:12, color:'#65C285', opacity:.6, marginTop:4 }}>اسألني بالعربية أو العامية العراقية</div>
      </div>

      {/* Quick questions */}
      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            style={{ background:'rgba(19,42,26,.6)', border:'1px solid rgba(101,194,133,.15)',
              borderRadius:10, padding:'6px 12px', fontSize:11, color:'#65C285',
              fontFamily:'Tajawal,sans-serif', cursor:'pointer' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflow:'auto', background:'rgba(19,42,26,.5)',
        border:'1px solid rgba(101,194,133,.1)', borderRadius:16, padding:16,
        marginBottom:14, display:'flex', flexDirection:'column', gap:0 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start',
            marginBottom:12, flexDirection: m.r==='user'?'row-reverse':'row' }}>
            <div style={{ width:28, height:28, borderRadius:'50%',
              background: m.r==='bot'?'#1e5c38':'#38A05F',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, flexShrink:0 }}>
              {m.r==='bot'?'🌾':'👨‍🌾'}
            </div>
            <div style={{ maxWidth:'80%', padding:'10px 13px', borderRadius:14,
              fontSize:12, lineHeight:1.7, whiteSpace:'pre-wrap',
              background: m.r==='bot'?'rgba(19,42,26,.8)':'rgba(56,160,95,.2)',
              border: m.r==='bot'?'1px solid rgba(101,194,133,.13)':'1px solid rgba(56,160,95,.28)',
              color: m.r==='bot'?'rgba(255,255,255,.85)':'#A8DFC0',
              borderTopRightRadius: m.r==='bot'?4:14,
              borderTopLeftRadius:  m.r==='user'?4:14 }}>
              {m.t}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'#1e5c38',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>🌾</div>
            <div style={{ background:'rgba(19,42,26,.8)',border:'1px solid rgba(101,194,133,.13)',
              padding:'10px 13px',borderRadius:14,display:'flex',gap:6,alignItems:'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8,height:8,background:'#38A05F',borderRadius:'50%',
                  animation:'bounce .7s infinite', animationDelay: i*.15+'s' }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{ display:'flex', gap:10 }}>
        <input value={inp} onChange={e=>setInp(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="اسألني عن زراعتك..."
          style={{ flex:1, background:'rgba(19,42,26,.7)',
            border:'1px solid rgba(101,194,133,.18)', borderRadius:11,
            padding:'10px 13px', fontFamily:'Tajawal,sans-serif',
            fontSize:13, color:'#fff', outline:'none' }}/>
        <button onClick={()=>send()} disabled={loading||!inp.trim()}
          style={{ background:'linear-gradient(135deg,#38A05F,#2A6E47)', color:'#fff',
            border:'none', borderRadius:11, padding:'10px 20px',
            fontFamily:'Tajawal,sans-serif', fontSize:13, fontWeight:700,
            cursor:'pointer', opacity: loading||!inp.trim()?0.5:1 }}>
          إرسال
        </button>
      </div>
    </div>
  )
}