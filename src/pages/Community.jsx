import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const INIT = [
  {av:'👨‍🌾',au:'أبو كاظم',loc:'الديوانية',t:'منذ ساعتين',tx:'الصدأ الأصفر انتشر في حقلنا، جربت Tebuconazole وأعطى نتائج ممتازة خلال أسبوع!',lk:24,cm:8},
  {av:'👩‍🌾',au:'أم صادق',loc:'كربلاء',t:'منذ 5 ساعات',tx:'موسم الطماطم ممتاز هذا العام، الإنتاج زاد 40% بسبب البيت المحمي.',lk:45,cm:12},
  {av:'👨‍🌾',au:'أبو رعد',loc:'نينوى',t:'أمس',tx:'سؤال: هل يؤثر الصقيع على نخيل التمر في الشمال؟',lk:12,cm:18},
]

const S = {
  card:{ background:'rgba(19,42,26,.65)', border:'1px solid rgba(101,194,133,.12)', borderRadius:16, padding:18, marginBottom:12 },
  input:{ width:'100%', background:'rgba(19,42,26,.7)', border:'1px solid rgba(101,194,133,.18)', borderRadius:11, padding:'10px 13px', fontFamily:'Tajawal,sans-serif', fontSize:13, color:'#fff', outline:'none', boxSizing:'border-box' },
}

export default function Community({ showNotif }) {
  const [posts,   setPosts]   = useState(INIT)
  const [txt,     setTxt]     = useState('')
  const [experts, setExperts] = useState([])
  const [showReq, setShowReq] = useState(false)
  const [selExp,  setSelExp]  = useState(null)
  const [reqMsg,  setReqMsg]  = useState('')

  useEffect(() => {
    supabase.from('community_posts').select('*, users(name,province)')
      .order('created_at',{ascending:false}).limit(20)
      .then(({ data }) => {
        if (data?.length) setPosts(data.map(p=>({
          av:'👨‍🌾', au:p.users?.name||'مزارع', loc:p.users?.province||'',
          t:'منذ قليل', tx:p.content, lk:p.likes_count||0, cm:p.comments_count||0
        })))
      })
    supabase.from('experts').select('*').eq('is_approved', true)
      .then(({ data }) => { if (data?.length) setExperts(data) })
  }, [])

  const addPost = async () => {
    if (!txt.trim()) return
    setPosts([{av:'👨‍🌾',au:'أبو علي',loc:'بابل',t:'الآن',tx:txt,lk:0,cm:0},...posts])
    await supabase.from('community_posts').insert({ content: txt })
    setTxt('')
    showNotif('✅','تم النشر!','شاركت تجربتك مع المزارعين')
  }

  const sendRequest = async () => {
    if (!reqMsg.trim()) return
    await supabase.from('expert_requests').insert({
      expert_id: selExp.id,
      message: reqMsg,
      status: 'pending'
    })
    setShowReq(false)
    setReqMsg('')
    showNotif('✅','تم إرسال الطلب!','سيتواصل معك الخبير قريباً')
  }

  const like = (i) => {
    const p = [...posts]
    p[i] = {...p[i], lk: p[i].lk+1}
    setPosts(p)
  }

  return (
    <div style={{ padding:'24px 24px 60px' }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:700, color:'#A8DFC0' }}>مجتمع المزارعين 👥</div>
        <div style={{ fontSize:12, color:'#65C285', opacity:.6, marginTop:4 }}>تبادل الخبرات مع المزارعين العراقيين</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

        {/* Posts */}
        <div>
          {posts.map((p,i) => (
            <div key={i} style={S.card}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:34, height:34, borderRadius:'50%',
                  background:'#1e5c38', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:16 }}>{p.av}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#A8DFC0' }}>{p.au}</div>
                  <div style={{ fontSize:9, color:'#65C285', opacity:.5 }}>📍 {p.loc} · {p.t}</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.8)', lineHeight:1.7, marginBottom:10 }}>{p.tx}</div>
              <div style={{ display:'flex', gap:14, borderTop:'1px solid rgba(101,194,133,.08)', paddingTop:10 }}>
                {[['❤️',p.lk,()=>like(i)],['💬',p.cm,()=>{}],['🔖','حفظ',()=>showNotif('🔖','تم!','')]].map(([ic,v,fn])=>(
                  <button key={ic} onClick={fn}
                    style={{ background:'none', border:'none', color:'#65C285',
                      fontSize:11, cursor:'pointer', opacity:.6,
                      fontFamily:'Tajawal,sans-serif' }}>
                    {ic} {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={S.card}>
            <textarea value={txt} onChange={e=>setTxt(e.target.value)}
              placeholder="شارك تجربتك أو اطرح سؤالاً..."
              style={{...S.input, minHeight:70, resize:'none', marginBottom:12}}/>
            <button onClick={addPost}
              style={{ background:'linear-gradient(135deg,#38A05F,#2A6E47)', color:'#fff',
                border:'none', borderRadius:10, padding:'10px 20px',
                fontFamily:'Tajawal,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              نشر
            </button>
          </div>
        </div>

        {/* Experts */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#65C285',
            letterSpacing:2, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:3,height:14,background:'#38A05F',borderRadius:2 }}/>
            خبراء معتمدون
          </div>

          {experts.length === 0 ? (
            <div style={S.card}>
              <div style={{ textAlign:'center', color:'rgba(255,255,255,.3)', padding:20 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>👨‍🏫</div>
                <div>جاري تحميل الخبراء...</div>
              </div>
            </div>
          ) : experts.map(e => (
            <div key={e.id} style={{...S.card, display:'flex', alignItems:'flex-start', gap:10}}>
              <div style={{ width:42, height:42, borderRadius:'50%',
                background:'#1e5c38', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:20, flexShrink:0 }}>
                👨‍🏫
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#A8DFC0' }}>{e.name}</div>
                <div style={{ fontSize:10, color:'#65C285', opacity:.7, marginTop:2 }}>{e.title}</div>
                <div style={{ fontSize:10, color:'#65C285', opacity:.5, marginTop:1 }}>📍 {e.province} — {e.specialization}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', marginTop:6, lineHeight:1.5 }}>{e.bio}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
                  <span style={{ fontSize:9, padding:'2px 8px', borderRadius:6, fontWeight:700,
                    background: e.is_available?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)',
                    color: e.is_available?'#4ade80':'#f87171' }}>
                    {e.is_available ? 'متاح الآن 🟢' : 'غير متاح 🔴'}
                  </span>
                  <span style={{ fontSize:9, color:'#F0CC6A' }}>⭐ {e.rating}</span>
                </div>
              </div>
              {e.is_available && (
                <button onClick={() => { setSelExp(e); setShowReq(true) }}
                  style={{ background:'#38A05F', color:'#fff', border:'none',
                    borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700,
                    fontFamily:'Tajawal,sans-serif', cursor:'pointer', whiteSpace:'nowrap' }}>
                  طلب جلسة
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Request Modal */}
      {showReq && selExp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div style={{ background:'#132a1a', border:'1px solid rgba(101,194,133,.2)',
            borderRadius:20, padding:28, width:'90%', maxWidth:420 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#A8DFC0', marginBottom:6 }}>
              طلب جلسة استشارية
            </div>
            <div style={{ fontSize:12, color:'#65C285', marginBottom:16 }}>
              مع {selExp.name} — {selExp.specialization}
            </div>
            <textarea
              value={reqMsg} onChange={e=>setReqMsg(e.target.value)}
              placeholder="اشرح سؤالك أو مشكلتك الزراعية..."
              style={{...S.input, minHeight:100, resize:'none', marginBottom:14}}/>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={sendRequest}
                style={{ flex:1, background:'linear-gradient(135deg,#38A05F,#2A6E47)',
                  color:'#fff', border:'none', borderRadius:10, padding:'11px',
                  fontFamily:'Tajawal,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                إرسال الطلب
              </button>
              <button onClick={() => setShowReq(false)}
                style={{ flex:1, background:'rgba(255,255,255,.08)',
                  color:'#fff', border:'none', borderRadius:10, padding:'11px',
                  fontFamily:'Tajawal,sans-serif', fontSize:13, cursor:'pointer' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}