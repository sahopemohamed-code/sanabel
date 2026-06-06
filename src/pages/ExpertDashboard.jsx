import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const S = {
  card: { background:'rgba(19,42,26,.65)', border:'1px solid rgba(101,194,133,.12)',
    borderRadius:16, padding:18, marginBottom:12 },
}

export default function ExpertDashboard({ user, showNotif }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('expert_requests')
      .select('*, users:farmer_id(full_name, phone)')
      .eq('expert_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setRequests(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('expert_requests')
      .update({ status })
      .eq('id', id)
    if (!error) {
      showNotif('✅', 'تم التحديث', status === 'confirmed' ? 'تم قبول الطلب' : 'تم رفض الطلب')
      fetchRequests()
    }
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
      height:300, color:'#65C285', fontSize:16 }}>
      جاري التحميل...
    </div>
  )

  return (
    <div style={{ padding:'24px 24px 60px' }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:700, color:'#A8DFC0' }}>لوحة تحكم الخبير 🌿</div>
        <div style={{ fontSize:12, color:'#65C285', opacity:.6, marginTop:4 }}>
          طلبات الاستشارة الواردة
        </div>
      </div>

      {/* إحصائية سريعة */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          ['📥', 'الكل', requests.length, '#60a5fa'],
          ['⏳', 'بانتظار الرد', requests.filter(r => r.status === 'pending').length, '#F0CC6A'],
          ['✅', 'مقبولة', requests.filter(r => r.status === 'confirmed').length, '#4ade80'],
        ].map(([e, l, n, c]) => (
          <div key={l} style={{ ...S.card, textAlign:'center', marginBottom:0 }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{e}</div>
            <div style={{ fontSize:22, fontWeight:900, color:c }}>{n}</div>
            <div style={{ fontSize:10, color:'#65C285', opacity:.7 }}>{l}</div>
          </div>
        ))}
      </div>

      {requests.length === 0 ? (
        <div style={{ ...S.card, textAlign:'center', padding:48 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>📭</div>
          <div style={{ color:'rgba(255,255,255,.3)', fontSize:13 }}>لا توجد طلبات استشارة حالياً</div>
        </div>
      ) : (
        requests.map(req => (
          <div key={req.id} style={S.card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:700, color:'#A8DFC0', fontSize:14 }}>
                  {req.users?.full_name || 'مزارع'}
                </div>
                <div style={{ fontSize:11, color:'#65C285', opacity:.6, marginTop:2 }}>
                  📞 {req.users?.phone || '—'}
                </div>
              </div>
              <span style={{
                padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700,
                background: req.status === 'pending'   ? 'rgba(240,204,106,.15)' :
                            req.status === 'confirmed' ? 'rgba(74,222,128,.15)' :
                            'rgba(248,113,113,.15)',
                color:      req.status === 'pending'   ? '#F0CC6A' :
                            req.status === 'confirmed' ? '#4ade80' : '#f87171',
                border:     `1px solid ${
                            req.status === 'pending'   ? 'rgba(240,204,106,.3)' :
                            req.status === 'confirmed' ? 'rgba(74,222,128,.3)' :
                            'rgba(248,113,113,.3)'}`
              }}>
                {req.status === 'pending' ? '⏳ بانتظار الرد' :
                 req.status === 'confirmed' ? '✅ مقبول' : '❌ مرفوض'}
              </span>
            </div>

            <div style={{ background:'rgba(0,0,0,.2)', borderRadius:10,
              padding:'10px 14px', fontSize:12, color:'rgba(255,255,255,.75)',
              lineHeight:1.7, marginBottom:10 }}>
              {req.message || 'لا توجد رسالة'}
            </div>

            <div style={{ fontSize:10, color:'#65C285', opacity:.4, marginBottom:10 }}>
              🕐 {new Date(req.created_at).toLocaleDateString('ar-IQ', {
                year:'numeric', month:'long', day:'numeric'
              })}
            </div>

            {req.status === 'pending' && (
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => updateStatus(req.id, 'confirmed')}
                  style={{ flex:1, background:'linear-gradient(135deg,#38A05F,#2A6E47)',
                    color:'#fff', border:'none', borderRadius:10, padding:'10px',
                    fontFamily:'Tajawal,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  ✅ قبول الطلب
                </button>
                <button onClick={() => updateStatus(req.id, 'rejected')}
                  style={{ flex:1, background:'rgba(248,113,113,.15)',
                    color:'#f87171', border:'1px solid rgba(248,113,113,.3)',
                    borderRadius:10, padding:'10px',
                    fontFamily:'Tajawal,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  ❌ رفض
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}