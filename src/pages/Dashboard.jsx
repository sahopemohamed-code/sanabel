import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getWeather } from '../lib/api'

const PROVINCE_COORDS = {
  'بغداد':       { lat: 33.3152, lon: 44.3661 },
  'البصرة':      { lat: 30.5085, lon: 47.7804 },
  'نينوى':       { lat: 36.3350, lon: 43.1189 },
  'أربيل':       { lat: 36.1901, lon: 44.0091 },
  'النجف':       { lat: 31.9904, lon: 44.3168 },
  'كربلاء':      { lat: 32.6158, lon: 44.0244 },
  'بابل':        { lat: 32.4720, lon: 44.4220 },
  'واسط':        { lat: 32.5418, lon: 45.8158 },
  'ذي قار':      { lat: 31.0461, lon: 46.2760 },
  'المثنى':      { lat: 31.3257, lon: 45.2857 },
  'القادسية':    { lat: 31.9926, lon: 44.9269 },
  'ميسان':       { lat: 31.8326, lon: 47.1506 },
  'ديالى':       { lat: 33.7691, lon: 44.9228 },
  'الأنبار':     { lat: 33.4058, lon: 43.3000 },
  'صلاح الدين':  { lat: 34.5337, lon: 43.4836 },
  'كركوك':       { lat: 35.4681, lon: 44.3922 },
  'السليمانية':  { lat: 35.5572, lon: 45.4329 },
  'دهوك':        { lat: 36.8669, lon: 42.9903 },
}

const CROP_TYPES = ['🌾 حنطة','🍅 طماطم','🌴 نخيل','🥒 خيار','🧅 بصل','🥔 بطاطا',
  '🌽 ذرة','🍆 باذنجان','🫑 فلفل','🍉 رقي','🍇 عنب','🫒 زيتون','🌿 عدس','🟤 حمص']

const PROVINCES = ['بغداد','البصرة','نينوى','أربيل','النجف','كربلاء','بابل',
  'واسط','ذي قار','المثنى','القادسية','ميسان','ديالى','الأنبار','صلاح الدين',
  'كركوك','السليمانية','دهوك']

const FALLBACK_NOTIFS = [
  { icon:'🦠', title:'صدأ أصفر — حقل الحنطة', body:'منذ ساعتين',   color:'#ef4444' },
  { icon:'💧', title:'تم ري حقل الشمال',       body:'اليوم 5:30 ص', color:'#22c55e' },
  { icon:'🛒', title:'طلب شراء طماطم',          body:'أمس — بغداد',  color:'#3b82f6' },
  { icon:'💊', title:'موعد التسميد غداً',       body:'7:00 ص',       color:'#e8b84b' },
]

const S = {
  input: { width:'100%', background:'rgba(19,42,26,.7)', border:'1px solid rgba(101,194,133,.18)',
    borderRadius:11, padding:'10px 13px', fontFamily:'Tajawal,sans-serif',
    fontSize:13, color:'#fff', outline:'none', boxSizing:'border-box', marginBottom:12 },
  label: { display:'block', fontSize:11, fontWeight:600, color:'#65C285', marginBottom:5 },
}

export default function Dashboard({ showNotif }) {
  const [weather,    setWeather]    = useState(null)
  const [crops,      setCrops]      = useState([])
  const [province,   setProvince]   = useState(null)
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 1024)
  const [showAdd,    setShowAdd]    = useState(false)
  const [addForm,    setAddForm]    = useState({ name:'حنطة', area:'', province:'بابل', stage:'نمو خضري' })
  const [saving,     setSaving]     = useState(false)
  const [notifs,     setNotifs]     = useState([])
  const [unread,     setUnread]     = useState(0)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadWeather()
    loadCrops()
    loadNotifs()
  }, [])

  const loadNotifs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase
      .from('users').select('id').eq('auth_id', user.id).single()
    if (!userData) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data?.length) {
      setNotifs(data)
      setUnread(data.filter(n => !n.is_read).length)
    }
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase
      .from('users').select('id').eq('auth_id', user.id).single()
    if (!userData) return
    await supabase.from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.id)
      .eq('is_read', false)
    setUnread(0)
    setNotifs(notifs.map(n => ({...n, is_read: true})))
  }

  const loadCrops = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('crops').select('*')
        .eq('user_id', user.id).limit(10)
      setCrops(data || [])
    }
  }

  const loadWeather = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users').select('province').eq('auth_id', user.id).single()
      if (userData?.province && PROVINCE_COORDS[userData.province]) {
        setProvince(userData.province)
        const { lat, lon } = PROVINCE_COORDS[userData.province]
        const r = await getWeather(lat, lon)
        if (r.success) { setWeather(r.data); return }
      }
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => getWeather(pos.coords.latitude, pos.coords.longitude).then(r => { if(r.success) setWeather(r.data) }),
        () => getWeather(33.3152, 44.3661).then(r => { if(r.success) setWeather(r.data) })
      )
    } else {
      getWeather(33.3152, 44.3661).then(r => { if(r.success) setWeather(r.data) })
    }
  }

  const addCrop = async () => {
    if (!addForm.area) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('crops').insert({
      name: addForm.name.replace(/[^a-zA-Z\u0600-\u06FF ]/g,'').trim(),
      area: +addForm.area,
      province: addForm.province,
      stage: addForm.stage,
      user_id: user.id
    })
    if (error) showNotif('❌','خطأ',error.message)
    else {
      showNotif('✅','تم الإضافة!','تمت إضافة المحصول بنجاح')
      setShowAdd(false)
      setAddForm({ name:'حنطة', area:'', province:'بابل', stage:'نمو خضري' })
      loadCrops()
    }
    setSaving(false)
  }

  const deleteCrop = async (id) => {
    await supabase.from('crops').delete().eq('id', id)
    setCrops(crops.filter(c => c.id !== id))
    showNotif('🗑️','تم الحذف','تم حذف المحصول')
  }

  const displayNotifs = notifs.length > 0 ? notifs : FALLBACK_NOTIFS

  const stats = [
    { i:'🌾', n: crops.length || 0, l:'محاصيل نشطة',    bg:'1e5c38,#132a1a' },
    { i:'💧', n:'38%',              l:'توفير مياه الري', bg:'1a3a50,#0f2535' },
    { i:'💰', n:'1.2M',             l:'مبيعات (دينار)',  bg:'3a2a0f,#251c08' },
    { i:'🔬', n:2,                  l:'تشخيصات الأسبوع', bg:'3a1515,#250f0f' },
  ]

  return (
    <div style={{ padding: isMobile ? '16px 12px 20px' : '24px 24px 60px' }}>

      {weather && (
        <div style={{ background:'linear-gradient(135deg,rgba(19,42,26,.9),rgba(10,26,13,.9))',
          border:'1px solid rgba(101,194,133,.18)', borderRadius:18, padding: isMobile ? 14 : 20,
          display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <span style={{ fontSize: isMobile ? 36 : 44 }}>{weather.temp>35?'☀️':weather.temp>20?'⛅':'🌤️'}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize: isMobile ? 30 : 38, fontWeight:900 }}>{weather.temp}°م</div>
            <div style={{ color:'#65C285', fontSize:12, marginTop:3 }}>
              📍 محافظة {province || weather.city}
            </div>
            <div style={{ display:'flex', gap:14, marginTop:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, color:'#A8DFC0', opacity:.7 }}>💧 {weather.humidity}%</span>
              <span style={{ fontSize:10, color:'#A8DFC0', opacity:.7 }}>💨 {weather.wind_speed} كم/س</span>
            </div>
          </div>
          {weather.temp>38 && (
            <div style={{ background:'rgba(230,126,34,.15)', border:'1px solid rgba(230,126,34,.3)',
              borderRadius:10, padding:'6px 10px', fontSize:10, color:'#fcd9a0', textAlign:'center' }}>
              ⚠️ حرارة عالية
            </div>
          )}
        </div>
      )}

      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
        gap: isMobile ? 10 : 14, marginBottom:16 }}>
        {stats.map(s => (
          <div key={s.l} style={{ background:`linear-gradient(135deg,#${s.bg})`,
            borderRadius:14, padding: isMobile ? 12 : 16 }}>
            <div style={{ fontSize: isMobile ? 20 : 24, marginBottom:4 }}>{s.i}</div>
            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight:900 }}>{s.n}</div>
            <div style={{ fontSize: isMobile ? 9 : 10, opacity:.7, marginTop:3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? 12 : 18 }}>

        {/* محاصيلي */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#65C285',
            letterSpacing:2, marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:3, height:14, background:'#38A05F', borderRadius:2 }}/>
              محاصيلي
            </div>
            <button onClick={() => setShowAdd(!showAdd)}
              style={{ background:'#38A05F', color:'#fff', border:'none',
                borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700,
                fontFamily:'Tajawal,sans-serif', cursor:'pointer' }}>
              + إضافة
            </button>
          </div>

          {showAdd && (
            <div style={{ background:'rgba(19,42,26,.8)', border:'1px solid rgba(101,194,133,.2)',
              borderRadius:14, padding:14, marginBottom:12 }}>
              <label style={S.label}>نوع المحصول</label>
              <select style={S.input} value={addForm.name}
                onChange={e => setAddForm({...addForm, name:e.target.value.replace(/[^a-zA-Z\u0600-\u06FF ]/g,'').trim()})}>
                {CROP_TYPES.map(c => <option key={c} value={c.replace(/[^a-zA-Z\u0600-\u06FF ]/g,'').trim()}>{c}</option>)}
              </select>
              <label style={S.label}>المساحة (دونم)</label>
              <input type="number" style={S.input} placeholder="10"
                value={addForm.area} onChange={e => setAddForm({...addForm, area:e.target.value})}/>
              <label style={S.label}>المحافظة</label>
              <select style={S.input} value={addForm.province}
                onChange={e => setAddForm({...addForm, province:e.target.value})}>
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
              <label style={S.label}>مرحلة النمو</label>
              <select style={S.input} value={addForm.stage}
                onChange={e => setAddForm({...addForm, stage:e.target.value})}>
                {['بادرة','نمو خضري','إزهار','إثمار','نضج'].map(s => <option key={s}>{s}</option>)}
              </select>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={addCrop} disabled={saving}
                  style={{ flex:1, background:'linear-gradient(135deg,#38A05F,#2A6E47)',
                    color:'#fff', border:'none', borderRadius:10, padding:'10px',
                    fontFamily:'Tajawal,sans-serif', fontSize:13, fontWeight:700,
                    cursor:'pointer', opacity: saving?0.7:1 }}>
                  {saving ? 'جاري...' : '✅ حفظ'}
                </button>
                <button onClick={() => setShowAdd(false)}
                  style={{ flex:1, background:'rgba(255,255,255,.08)',
                    color:'#fff', border:'none', borderRadius:10, padding:'10px',
                    fontFamily:'Tajawal,sans-serif', fontSize:13, cursor:'pointer' }}>
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {crops.length === 0 ? (
            <div style={{ background:'rgba(19,42,26,.5)', border:'1px solid rgba(101,194,133,.1)',
              borderRadius:14, padding:24, textAlign:'center', color:'rgba(255,255,255,.2)' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🌱</div>
              <div>لا توجد محاصيل بعد</div>
              <div style={{ fontSize:11, marginTop:6, opacity:.5 }}>اضغط + إضافة لإضافة محصولك</div>
            </div>
          ) : crops.map(c => (
            <div key={c.id} style={{ background:'rgba(19,42,26,.5)',
              border:'1px solid rgba(101,194,133,.1)', borderRadius:14,
              padding:12, display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:22 }}>🌾</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#A8DFC0' }}>{c.name}</div>
                <div style={{ fontSize:10, color:'#65C285', margin:'2px 0' }}>
                  📍 {c.province} — {c.area} دونم
                </div>
                <div style={{ fontSize:10, color:'#F0CC6A', marginBottom:4 }}>{c.stage}</div>
                <div style={{ height:4, background:'rgba(101,194,133,.12)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:'60%', height:'100%',
                    background:'linear-gradient(to left,#38A05F,#65C285)', borderRadius:2 }}/>
                </div>
              </div>
              <button onClick={() => deleteCrop(c.id)}
                style={{ background:'none', border:'none', color:'rgba(248,113,113,.5)',
                  cursor:'pointer', fontSize:16, padding:4 }}>
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* الإشعارات */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#65C285',
            letterSpacing:2, marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:3, height:14, background:'#38A05F', borderRadius:2 }}/>
              آخر التنبيهات
              {unread > 0 && (
                <span style={{ background:'#ef4444', color:'#fff', fontSize:9,
                  fontWeight:700, borderRadius:10, padding:'1px 6px' }}>
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead}
                style={{ background:'none', border:'none', color:'#65C285',
                  fontSize:10, cursor:'pointer', fontFamily:'Tajawal,sans-serif', opacity:.7 }}>
                قراءة الكل ✓
              </button>
            )}
          </div>

          {displayNotifs.map((a, i) => (
            <div key={i} style={{ background: a.is_read === false ? 'rgba(56,160,95,.08)' : 'rgba(19,42,26,.4)',
              borderRadius:12, padding:'10px 12px',
              display:'flex', alignItems:'center', gap:10,
              borderRight:`3px solid ${a.color || a.c || '#65C285'}`,
              marginBottom:9,
              border: a.is_read === false ? '1px solid rgba(56,160,95,.2)' : 'none',
              borderRight:`3px solid ${a.color || a.c || '#65C285'}` }}>
              <span style={{ fontSize:16 }}>{a.icon || a.i}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize: isMobile ? 12 : 11, fontWeight:700, color:'#A8DFC0' }}>
                  {a.title || a.t}
                </div>
                <div style={{ fontSize:9, color:'#65C285', marginTop:2 }}>
                  {a.body || a.d || (a.created_at && new Date(a.created_at).toLocaleDateString('ar-IQ'))}
                </div>
              </div>
              {a.is_read === false && (
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#38A05F', flexShrink:0 }}/>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}