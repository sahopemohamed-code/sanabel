import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import Notification from './components/Notification'
import Dashboard from './pages/Dashboard'
import Diagnosis from './pages/Diagnosis'
import Irrigation from './pages/Irrigation'
import Market from './pages/Market'
import Calendar from './pages/Calendar'
import Community from './pages/Community'
import Assistant from './pages/Assistant'
import Auth from './pages/Auth'
import ExpertDashboard from './pages/ExpertDashboard'

export default function App() {
  const [page, setPage]       = useState('dashboard')
  const [user, setUser]       = useState(null)
  const [loading, setLoad]    = useState(true)
  const [notif, setNotif]     = useState(null)
  const [isExpert, setIsExpert] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoad(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) checkIfExpert()
  }, [user])

  const checkIfExpert = async () => {
    const { data } = await supabase
      .from('experts')
      .select('id')
      .eq('auth_id', user.id)
      .single()
    setIsExpert(!!data)
  }

  const showNotif = (icon, title, body) => {
    setNotif({ icon, title, body })
    setTimeout(() => setNotif(null), 3500)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#0C1E13', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:64 }}>🌾</div>
      <div style={{ color:'#A8DFC0', fontSize:20, fontFamily:'Tajawal' }}>جاري التحميل...</div>
    </div>
  )

  if (!user) return <Auth showNotif={showNotif} />

  const pages = {
    dashboard:  isExpert
                  ? <ExpertDashboard user={user} showNotif={showNotif} />
                  : <Dashboard showNotif={showNotif} />,
    diagnosis:  <Diagnosis  showNotif={showNotif} />,
    irrigation: <Irrigation showNotif={showNotif} />,
    market:     <Market     showNotif={showNotif} />,
    calendar:   <Calendar   showNotif={showNotif} />,
    community:  <Community  showNotif={showNotif} />,
    assistant:  <Assistant  showNotif={showNotif} />,
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Tajawal,sans-serif',
      background:'#0C1E13', color:'white', direction:'rtl' }}>
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main style={{ flex:1, marginRight:220, minHeight:'100vh',
        background:'linear-gradient(135deg,#0C1E13,#0d1f11)' }}>
        <div className="fade-in">{pages[page]}</div>
      </main>
      {notif && <Notification {...notif} />}
    </div>
  )
}