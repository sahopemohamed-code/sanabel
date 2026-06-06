import { useState } from 'react'
import { supabase } from '../lib/supabase'

const PROVINCES = ['بغداد','البصرة','نينوى','أربيل','النجف','كربلاء','بابل',
  'واسط','ذي قار','المثنى','القادسية','ميسان','ديالى','الأنبار','صلاح الدين',
  'كركوك','السليمانية','دهوك']

const S = {
  input: { width:'100%', background:'rgba(22,51,36,.7)',
    border:'1px solid rgba(101,194,133,.2)', borderRadius:11,
    padding:'10px 13px', fontFamily:'Tajawal,sans-serif',
    fontSize:13, color:'#fff', outline:'none', boxSizing:'border-box',
    marginBottom:14 },
  label: { display:'block', fontSize:11, fontWeight:600,
    color:'#65C285', marginBottom:6 },
  btn: { width:'100%', background:'linear-gradient(135deg,#38A05F,#2A6E47)',
    color:'#fff', border:'none', borderRadius:12, padding:'13px',
    fontFamily:'Tajawal,sans-serif', fontSize:15, fontWeight:700,
    cursor:'pointer', marginTop:4 }
}

export default function Auth({ showNotif }) {
  const [mode, setMode]     = useState('login')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [name, setName]     = useState('')
  const [prov, setProv]     = useState('بابل')
  const [loading, setLoad]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoad(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
        if (error) throw error
        showNotif('🌾', 'أهلاً بك!', 'تم تسجيل الدخول')
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password: pass })
        if (error) throw error
        if (data.user) {
          await supabase.from('users').insert({
            auth_id: data.user.id, name, province: prov
          })
        }
        showNotif('✅', 'تم إنشاء الحساب!', 'مرحباً في سنابل')
      }
    } catch (err) {
      showNotif('❌', 'خطأ', err.message)
    } finally {
      setLoad(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', padding:20,
      background:'linear-gradient(135deg,#0C1E13,#163324)' }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:64, marginBottom:12 }}>🌾</div>
          <div style={{ fontFamily:'Amiri,serif', fontSize:48,
            color:'#A8DFC0', fontWeight:700, marginBottom:8 }}>سنابل</div>
          <div style={{ color:'#65C285', fontSize:14 }}>منصة الزراعة الذكية العراقية</div>
        </div>

        <div style={{ background:'rgba(22,51,36,.6)',
          border:'1px solid rgba(101,194,133,.15)',
          borderRadius:20, padding:28 }}>

          <div style={{ display:'flex', marginBottom:20,
            borderRadius:12, overflow:'hidden',
            border:'1px solid rgba(101,194,133,.2)' }}>
            {[['login','دخول'],['register','حساب جديد']].map(([m,l]) => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex:1, padding:'10px', fontSize:13, fontWeight:700,
                  fontFamily:'Tajawal,sans-serif', cursor:'pointer', border:'none',
                  background: mode===m ? '#38A05F' : 'transparent',
                  color: mode===m ? '#fff' : 'rgba(101,194,133,.5)' }}>
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && <>
              <label style={S.label}>الاسم الكامل</label>
              <input style={S.input} value={name}
                onChange={e => setName(e.target.value)}
                placeholder="أبو علي" required />
              <label style={S.label}>المحافظة</label>
              <select style={{...S.input, marginBottom:14}}
                value={prov} onChange={e => setProv(e.target.value)}>
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </>}
            <label style={S.label}>البريد الإلكتروني</label>
            <input style={S.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com" required />
            <label style={S.label}>كلمة المرور</label>
            <input style={S.input} type="password" value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••" required minLength={6} />
            <button style={S.btn} disabled={loading}>
              {loading ? 'جاري...' : mode==='login' ? 'دخول' : 'إنشاء حساب'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', color:'rgba(255,255,255,.2)',
          fontSize:11, marginTop:16 }}>
          © 2026 صهيب محمد — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  )
}