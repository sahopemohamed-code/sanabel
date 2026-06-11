import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PRICES = [
  {n:'حنطة',e:'🌾',p:850,c:2.3},{n:'طماطم',e:'🍅',p:1200,c:-1.1},
  {n:'تمر زهدي',e:'🌴',p:3500,c:.8},{n:'بطاطا',e:'🥔',p:600,c:4.2},
  {n:'بصل',e:'🧅',p:650,c:-.5},{n:'خيار',e:'🥒',p:900,c:3.2},
  {n:'ذرة',e:'🌽',p:750,c:1.8},{n:'باذنجان',e:'🍆',p:1100,c:-2},
]
const LISTINGS = [
  {e:'🌾',n:'حنطة عراقية',s:'أبو محمد — الديوانية',p:850,q:'500 كغ'},
  {e:'🌴',n:'تمر زهدي',s:'أبو حسين — البصرة',p:3500,q:'200 كغ'},
  {e:'🍅',n:'طماطم بيت محمي',s:'أم علي — كربلاء',p:1200,q:'300 كغ'},
]
const S = {
  card:{ background:'rgba(19,42,26,.65)', border:'1px solid rgba(101,194,133,.12)', borderRadius:16, padding:18, marginBottom:12 },
  input:{ width:'100%', background:'rgba(19,42,26,.7)', border:'1px solid rgba(101,194,133,.18)', borderRadius:11, padding:'10px 13px', fontFamily:'Tajawal,sans-serif', fontSize:13, color:'#fff', outline:'none', boxSizing:'border-box', marginBottom:14 },
  label:{ display:'block', fontSize:11, fontWeight:600, color:'#65C285', marginBottom:6 },
}

export default function Market({ showNotif }) {
  const [tab, setTab] = useState('browse')
  const [listings, setListings] = useState([])
  const [form, setForm] = useState({ crop_type:'حنطة', quantity:'', price_per_unit:'', province:'بابل' })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    supabase.from('market_listings').select('*').eq('is_available', true).limit(20)
      .then(({ data }) => setListings(data?.length ? data : LISTINGS))
  }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('market_listings').insert({
      ...form, quantity: +form.quantity, price_per_unit: +form.price_per_unit, is_available: true
    })
    if (error) showNotif('❌','خطأ',error.message)
    else { showNotif('✅','تم النشر!','سيتواصل المشترون قريباً'); setForm({crop_type:'حنطة',quantity:'',price_per_unit:'',province:'بابل'}) }
  }

  return (
    <div style={{ padding: isMobile ? '16px 12px 20px' : '24px 24px 60px' }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:'#A8DFC0' }}>السوق الزراعي 🛒</div>
        <div style={{ fontSize:12, color:'#65C285', opacity:.6, marginTop:4 }}>أسعار لحظية وبيع مباشر</div>
      </div>

      {/* ملاحظة الأسعار */}
      <div style={{ marginBottom:14, padding:'10px 14px',
        background:'rgba(212,168,50,.1)', border:'1px solid rgba(212,168,50,.35)',
        borderRadius:10, display:'flex', alignItems:'flex-start', gap:8 }}>
        <span style={{ fontSize:16 }}>⚠️</span>
        <span style={{ fontSize: isMobile ? 12 : 11, color:'#F0CC6A', lineHeight:1.7, fontWeight:600 }}>
          الأسعار تقريبية وتحديثها يدوي — تحقق من أسعار السوق المحلي
        </span>
      </div>

      {/* Ticker */}
      <div style={{ background:'rgba(10,26,13,.7)', border:'1px solid rgba(101,194,133,.12)',
        borderRadius:12, padding:'10px 16px', marginBottom:16, overflow:'hidden' }}>
        <div style={{ display:'flex', gap:24, animation:'ticker 22s linear infinite', width:'max-content' }}>
          {[...PRICES,...PRICES].map((p,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}>
              <span>{p.e}</span>
              <span style={{ fontWeight:700, color:'#A8DFC0', fontSize:12 }}>{p.n}</span>
              <span style={{ color:'#F0CC6A', fontWeight:800, fontSize:12 }}>{p.p.toLocaleString('ar')} د.ع</span>
              <span style={{ fontSize:10, fontWeight:700, color: p.c>=0?'#4ade80':'#f87171' }}>
                {p.c>=0?'↑':'↓'}{Math.abs(p.c)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[['browse','تصفح العروض'],['sell','بيع محصولك'],['prices','الأسعار']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: isMobile ? 1 : 'none',
              padding: isMobile ? '10px 8px' : '8px 16px',
              borderRadius:10, fontSize: isMobile ? 11 : 12, fontWeight:700,
              fontFamily:'Tajawal,sans-serif', cursor:'pointer', border:'none',
              background: tab===t ? '#38A05F' : 'rgba(19,42,26,.6)',
              color: tab===t ? '#fff' : '#65C285' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <div>
          {(listings.length ? listings : LISTINGS).map((l,i) => (
            <div key={i} style={{ ...S.card, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width: isMobile ? 42 : 46, height: isMobile ? 42 : 46,
                background:'rgba(30,92,56,.2)', borderRadius:12,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: isMobile ? 22 : 24, flexShrink:0 }}>
                {l.e || l.emoji || '🌾'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize: isMobile ? 14 : 13, fontWeight:700, color:'#A8DFC0' }}>{l.n || l.crop_type}</div>
                <div style={{ fontSize:10, color:'#65C285', opacity:.6, marginTop:2 }}>📍 {l.s || l.province}</div>
                <div style={{ fontSize:10, color:'#60a5fa', marginTop:4 }}>{l.q || l.quantity+' كغ'}</div>
              </div>
              <div style={{ textAlign:'left', flexShrink:0 }}>
                <div style={{ fontSize: isMobile ? 15 : 16, fontWeight:900, color:'#A8DFC0' }}>
                  {(l.p || l.price_per_unit || 0).toLocaleString('ar')}
                </div>
                <div style={{ fontSize:9, color:'#65C285', opacity:.5 }}>د.ع/كغ</div>
                <button onClick={() => showNotif('🛒','تم الطلب!','سيتواصل البائع قريباً')}
                  style={{ marginTop:6, background:'#38A05F', color:'#fff', border:'none',
                    borderRadius:8, padding: isMobile ? '7px 14px' : '5px 12px',
                    fontSize: isMobile ? 12 : 11, fontWeight:700,
                    fontFamily:'Tajawal,sans-serif', cursor:'pointer' }}>
                  اشتري
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sell' && (
        <form onSubmit={handlePost} style={S.card}>
          {[['نوع المحصول','crop_type','select',['🌾 حنطة','🍅 طماطم','🌴 تمر','🥒 خيار','🧅 بصل','🥔 بطاطا','🌽 ذرة','🍆 باذنجان','🫑 فلفل','🍉 رقي','🍈 بطيخ','🍎 تفاح','🍊 برتقال','🍋 ليمون','🍇 عنب','🍓 فراولة','🫒 زيتون','🌿 عدس','🟤 حمص']],
            ['المحافظة','province','select',['بغداد','البصرة','نينوى','بابل','كربلاء','النجف']],
          ].map(([l,k,t,opts]) => (
            <div key={k}>
              <label style={S.label}>{l}</label>
              <select style={S.input} value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <label style={S.label}>الكمية (كغ)</label>
          <input type="number" style={S.input} placeholder="500"
            value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})} required/>
          <label style={S.label}>السعر (د.ع/كغ)</label>
          <input type="number" style={S.input} placeholder="850"
            value={form.price_per_unit} onChange={e => setForm({...form,price_per_unit:e.target.value})} required/>
          <button type="submit"
            style={{ width:'100%', background:'linear-gradient(135deg,#D4A832,#a37618)',
              color:'#fff', border:'none', borderRadius:12,
              padding: isMobile ? 16 : 13,
              fontFamily:'Tajawal,sans-serif', fontSize: isMobile ? 16 : 14,
              fontWeight:700, cursor:'pointer' }}>
            نشر العرض في السوق
          </button>
        </form>
      )}

      {tab === 'prices' && (
        <div style={S.card}>
          {PRICES.map((p,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0',
              borderTop: i>0 ? '1px solid rgba(101,194,133,.08)' : 'none' }}>
              <span style={{ fontSize: isMobile ? 22 : 20 }}>{p.e}</span>
              <span style={{ flex:1, fontSize: isMobile ? 13 : 12, color:'#A8DFC0', fontWeight:600 }}>{p.n}</span>
              <span style={{ fontSize: isMobile ? 14 : 13, fontWeight:800, color:'#F0CC6A' }}>{p.p.toLocaleString('ar')}</span>
              <span style={{ fontSize:10, fontWeight:700, width:45,
                color: p.c>=0?'#4ade80':'#f87171' }}>{p.c>=0?'↑':'↓'}{Math.abs(p.c)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}