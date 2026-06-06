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