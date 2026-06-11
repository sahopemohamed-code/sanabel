import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const NAV = [
  { id:'dashboard',  icon:'🏠', label:'لوحة التحكم' },
  { id:'diagnosis',  icon:'🔬', label:'تشخيص الأمراض' },
  { id:'irrigation', icon:'💧', label:'نظام الري' },
  { id:'market',     icon:'🛒', label:'السوق الزراعي' },
  { id:'calendar',   icon:'📅', label:'التقويم الزراعي' },
  { id:'community',  icon:'👥', label:'مجتمع المزارعين' },
  { id:'assistant',  icon:'🤖', label:'المساعد الذكي' },
]

export default function Sidebar({ currentPage, onNavigate }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // شريط سفلي للهاتف
  if (isMobile) return (
    <>
      {/* شريط علوي */}
      <div style={{ position:'fixed', top:0, right:0, left:0, zIndex:200,
        background:'linear-gradient(180deg,#0c1e11,#091508)',
        borderBottom:'1px solid rgba(101,194,133,.12)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 16px', height:56 }}>
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background:'none', border:'none', color:'#65C285',
            fontSize:22, cursor:'pointer' }}>
          ☰
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>🌾</span>
          <div style={{ fontFamily:'Amiri,serif', fontSize:18, color:'#A8DFC0', fontWeight:700 }}>سنابل</div>
        </div>
        <button onClick={() => supabase.auth.signOut()}
          style={{ background:'none', border:'none', color:'rgba(248,113,113,.6)',
            cursor:'pointer', fontFamily:'Tajawal,sans-serif', fontSize:11 }}>
          خروج
        </button>
      </div>

      {/* قائمة منسدلة */}
      {menuOpen && (
        <div style={{ position:'fixed', top:56, right:0, left:0, zIndex:199,
          background:'#0c1e11', borderBottom:'1px solid rgba(101,194,133,.12)',
          padding:'8px 0' }}>
          {NAV.map(item => (
            <div key={item.id}
              onClick={() => { onNavigate(item.id); setMenuOpen(false) }}
              style={{ display:'flex', alignItems:'center', gap:12,
                padding:'12px 20px', cursor:'pointer',
                background: currentPage===item.id ? 'rgba(56,160,95,.15)' : 'transparent',
                color: currentPage===item.id ? '#65C285' : 'rgba(255,255,255,.6)',
                fontSize:14, borderRight: currentPage===item.id ? '3px solid #38A05F' : '3px solid transparent' }}>
              <span style={{ fontSize:18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* شريط تنقل سفلي */}
      <div style={{ position:'fixed', bottom:0, right:0, left:0, zIndex:200,
        background:'linear-gradient(0deg,#0c1e11,#091508)',
        borderTop:'1px solid rgba(101,194,133,.12)',
        display:'flex', justifyContent:'space-around', padding:'6px 0', height:60 }}>
        {NAV.slice(0,5).map(item => (
          <div key={item.id} onClick={() => onNavigate(item.id)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center',
              gap:3, cursor:'pointer', padding:'4px 8px', borderRadius:8,
              background: currentPage===item.id ? 'rgba(56,160,95,.2)' : 'transparent',
              color: currentPage===item.id ? '#65C285' : 'rgba(255,255,255,.3)',
              minWidth:50 }}>
            <span style={{ fontSize:18 }}>{item.icon}</span>
            <span style={{ fontSize:8, textAlign:'center', lineHeight:1.2 }}>{item.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </>
  )

  // شريط جانبي للحاسوب
  return (
    <aside style={{ width:220, background:'linear-gradient(180deg,#0c1e11,#091508)',
      borderLeft:'1px solid rgba(101,194,133,.12)', display:'flex', flexDirection:'column',
      position:'fixed', top:0, right:0, height:'100vh', zIndex:100 }}>

      <div style={{ padding:'22px 16px 18px', borderBottom:'1px solid rgba(101,194,133,.08)',
        display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:26 }}>🌾</span>
        <div>
          <div style={{ fontFamily:'Amiri,serif', fontSize:20, color:'#A8DFC0', fontWeight:700 }}>سنابل</div>
          <div style={{ fontSize:9, color:'#65C285', fontWeight:300 }}>الزراعة الذكية العراقية</div>
        </div>
      </div>

      <nav style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
        {NAV.map(item => (
          <div key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
              cursor:'pointer', borderRight:`3px solid ${currentPage===item.id?'#38A05F':'transparent'}`,
              background: currentPage===item.id ? 'rgba(56,160,95,.15)' : 'transparent',
              color: currentPage===item.id ? '#65C285' : 'rgba(255,255,255,.35)',
              fontSize:13, fontWeight:500, transition:'all .2s' }}>
            <span style={{ fontSize:16, width:18, textAlign:'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(101,194,133,.08)',
        fontSize:10, color:'rgba(255,255,255,.2)', lineHeight:1.7 }}>
        <div>© 2026 <strong style={{ color:'rgba(101,194,133,.45)' }}>سنابل</strong></div>
        <div>تطوير: <strong style={{ color:'rgba(101,194,133,.45)' }}>صهيب محمد</strong></div>
        <button onClick={() => supabase.auth.signOut()}
          style={{ background:'none', border:'none', color:'rgba(248,113,113,.5)',
            cursor:'pointer', fontFamily:'Tajawal,sans-serif', fontSize:10, marginTop:4 }}>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}