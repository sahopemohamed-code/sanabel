import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PROVINCES = ['بغداد','البصرة','نينوى','أربيل','النجف','كربلاء','بابل',
  'واسط','ذي قار','المثنى','القادسية','ميسان','ديالى','الأنبار','صلاح الدين',
  'كركوك','السليمانية','دهوك']

const S = {
  card: { background:'rgba(19,42,26,.65)', border:'1px solid rgba(101,194,133,.12)', borderRadius:16, padding:18, marginBottom:16 },
  label: { display:'block', fontSize:11, fontWeight:600, color:'#65C285', marginBottom:6 },
  input: { width:'100%', background:'rgba(19,42,26,.7)', border:'1px solid rgba(101,194,133,.18)',
    borderRadius:11, padding:'10px 13px', fontFamily:'Tajawal,sans-serif',
    fontSize:13, color:'#fff', outline:'none', boxSizing:'border-box', marginBottom:14 },
}

export default function Profile({ showNotif }) {
  const [user, setUser]       = useState(null)
  const [name, setName]       = useState('')
  const [prov, setProv]       = useState('بابل')
  const [phone, setPhone]     = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single()
      if (data) {
        setName(data.name || '')
        setProv(data.province || 'بابل')
        setPhone(data.phone || '')
      }
    }
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('users')
      .update({ name, province: prov, phone })
      .eq('auth_id', user.id)
    if (error) showNotif('❌', 'خطأ', error.message)
    else showNotif('✅', 'تم الحفظ!', 'تم تحديث ملفك الشخصي')
    setSaving(false)
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
      height:300, color:'#65C285', fontSize:16 }}>
      جاري التحميل...
    </div>
  )

  return (
    <div style={{ padding: isMobile ? '16px 12px 80px' : '24px 24px 60px', maxWidth:600 }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:'#A8DFC0' }}>ملفي الشخصي 👤</div>
        <div style={{ fontSize:12, color:'#65C285', opacity:.6, marginTop:4 }}>تعديل بياناتك الشخصية</div>
      </div>

      {/* معلومات الحساب */}
      <div style={S.card}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'#1e5c38',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>
            👨‍🌾
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#A8DFC0' }}>{name || 'مزارع'}</div>
            <div style={{ fontSize:11, color:'#65C285', opacity:.6, marginTop:3 }}>{user?.email}</div>
            <div style={{ fontSize:10, color:'#65C285', opacity:.5, marginTop:2 }}>📍 {prov}</div>
          </div>
        </div>
      </div>

      {/* تعديل البيانات */}
      <div style={S.card}>
        <div style={{ fontSize:12, fontWeight:700, color:'#65C285', marginBottom:16 }}>تعديل البيانات</div>

        <label style={S.label}>الاسم الكامل</label>
        <input style={S.input} value={name}
          onChange={e => setName(e.target.value)}
          placeholder="اسمك الكامل"/>

        <label style={S.label}>المحافظة</label>
        <select style={S.input} value={prov} onChange={e => setProv(e.target.value)}>
          {PROVINCES.map(p => <option key={p}>{p}</option>)}
        </select>

        <label style={S.label}>رقم الهاتف</label>
        <input style={S.input} type="tel" value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="07701234567"/>

        <button onClick={saveProfile} disabled={saving}
          style={{ width:'100%', background:'linear-gradient(135deg,#38A05F,#2A6E47)',
            color:'#fff', border:'none', borderRadius:12, padding: isMobile ? 16 : 13,
            fontFamily:'Tajawal,sans-serif', fontSize: isMobile ? 16 : 14,
            fontWeight:700, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
        </button>
      </div>

      {/* تسجيل الخروج */}
      <div style={S.card}>
        <button onClick={() => supabase.auth.signOut()}
          style={{ width:'100%', background:'rgba(248,113,113,.1)',
            color:'#f87171', border:'1px solid rgba(248,113,113,.3)',
            borderRadius:12, padding: isMobile ? 16 : 13,
            fontFamily:'Tajawal,sans-serif', fontSize: isMobile ? 16 : 14,
            fontWeight:700, cursor:'pointer' }}>
          تسجيل الخروج 🚪
        </button>
      </div>
    </div>
  )
}