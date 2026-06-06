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

export default function Dashboard({ showNotif }) {
  const [weather, setWeather] = useState(null)
  const [crops,   setCrops]   = useState([])

  useEffect(() => {
    loadWeather()
    supabase.from('crops').select('*').limit(5).then(({ data }) => setCrops(data||[]))
  }, [])

  const loadWeather = async () => {
    // جلب المحافظة من قاعدة البيانات
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('province')
        .eq('auth_id', user.id)
        .single()

      if (userData?.province && PROVINCE_COORDS[userData.province]) {
        const { lat, lon } = PROVINCE_COORDS[userData.province]
        const r = await getWeather(lat, lon)
        if (r.success) { setWeather(r.data); return }
      }
    }

    // fallback — GPS أو بغداد
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => getWeather(pos.coords.latitude, pos.coords.longitude).then(r => { if(r.success) setWeather(r.data) }),
        () => getWeather(33.3152, 44.3661).then(r => { if(r.success) setWeather(r.data) })
      )
    } else {
      getWeather(33.3152, 44.3661).then(r => { if(r.success) setWeather(r.data) })
    }
  }

  const stats = [
    { i:'🌾', n: crops.length || 0, l:'محاصيل نشطة',    bg:'#1e5c38,#132a1a' },
    { i:'💧', n:'38%',              l:'توفير مياه الري', bg:'#1a3a50,#0f2535' },
    { i:'💰', n:'1.2M',             l:'مبيعات (دينار)',  bg:'#3a2a0f,#251c08' },
    { i:'🔬', n:2,                  l:'تشخيصات الأسبوع', bg:'#3a1515,#250f0f' },
  ]

  const acts = [
    { i:'🦠', t:'صدأ أصفر — حقل الحنطة', d:'منذ ساعتين', c:'#ef4444' },
    { i:'💧', t:'تم ري حقل الشمال',       d:'اليوم 5:30 ص', c:'#22c55e' },
    { i:'🛒', t:'طلب شراء طماطم',          d:'أمس — بغداد', c:'#3b82f6' },
    { i:'💊', t:'موعد التسميد غداً',       d:'7:00 ص',      c:'#e8b84b' },
  ]

  return (
    <div style={{ padding:'24px 24px 60px' }}>

      {/* Weather */}
      {weather && (
        <div style={{ background:'linear-gradient(135deg,rgba(19,42,26,.9),rgba(10,26,13,.9))',
          border:'1px solid rgba(101,194,133,.18)', borderRadius:18, padding:20,
          display:'flex', alignItems:'center', gap:16, marginBottom:22 }}>
          <span style={{ fontSize:44 }}>{weather.temp>35?'☀️':weather.temp>20?'⛅':'🌤️'}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:38, fontWeight:900 }}>{weather.temp}°م</div>
            <div style={{ color:'#65C285', fontSize:12, marginTop:3 }}>📍 {weather.city}</div>
            <div style={{ display:'flex', gap:14, marginTop:8 }}>
              <span style={{ fontSize:10, color:'#A8DFC0', opacity:.7 }}>💧 {weather.humidity}%</span>
              <span style={{ fontSize:10, color:'#A8DFC0', opacity:.7 }}>💨 {weather.wind_speed} كم/س</span>
            </div>
          </div>
          {weather.temp>38 && (
            <div style={{ background:'rgba(230,126,34,.15)', border:'1px solid rgba(230,126,34,.3)',
              borderRadius:10, padding:'8px 12px', fontSize:10, color:'#fcd9a0' }}>
              ⚠️ حرارة عالية
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {stats.map(s => (
          <div key={s.l} style={{ background:`linear-gradient(135deg,#${s.bg})`,
            borderRadius:14, padding:16, position:'relative', overflow:'hidden' }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{s.i}</div>
            <div style={{ fontSize:24, fontWeight:900 }}>{s.n}</div>
            <div style={{ fontSize:10, opacity:.7, marginTop:3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

        {/* Crops */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#65C285',
            letterSpacing:2, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:3, height:14, background:'#38A05F', borderRadius:2 }}/>
            محاصيلي
          </div>
          {crops.length === 0 ? (
            <div style={{ background:'rgba(19,42,26,.5)', border:'1px solid rgba(101,194,133,.1)',
              borderRadius:14, padding:30, textAlign:'center', color:'rgba(255,255,255,.2)' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🌱</div>
              <div>لا توجد محاصيل بعد</div>
            </div>
          ) : crops.map(c => (
            <div key={c.id} style={{ background:'rgba(19,42,26,.5)',
              border:'1px solid rgba(101,194,133,.1)', borderRadius:14,
              padding:14, display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:24 }}>🌾</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#A8DFC0' }}>{c.name}</div>
                <div style={{ fontSize:10, color:'#65C285', margin:'4px 0 3px' }}>{c.province}</div>
                <div style={{ height:4, background:'rgba(101,194,133,.12)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:'60%', height:'100%',
                    background:'linear-gradient(to left,#38A05F,#65C285)', borderRadius:2 }}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#65C285',
            letterSpacing:2, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:3, height:14, background:'#38A05F', borderRadius:2 }}/>
            آخر التنبيهات
          </div>
          {acts.map(a => (
            <div key={a.t} style={{ background:'rgba(19,42,26,.4)',
              borderRadius:12, padding:'11px 13px',
              display:'flex', alignItems:'center', gap:10,
              borderRight:`3px solid ${a.c}`, marginBottom:9 }}>
              <span style={{ fontSize:17 }}>{a.i}</span>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#A8DFC0' }}>{a.t}</div>
                <div style={{ fontSize:9, color:'#65C285', marginTop:2 }}>{a.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}