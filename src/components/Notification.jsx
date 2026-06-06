export default function Notification({ icon, title, body }) {
  return (
    <div style={{
      position:'fixed', bottom:20, left:20, zIndex:999,
      background:'linear-gradient(135deg,#163324,#091508)',
      border:'1px solid rgba(101,194,133,.3)',
      borderRadius:16, padding:'12px 16px',
      display:'flex', alignItems:'center', gap:11,
      boxShadow:'0 8px 32px rgba(0,0,0,.5)',
      maxWidth:280, fontFamily:'Tajawal,sans-serif',
      animation:'slideIn .4s ease'
    }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <div>
        <div style={{ fontSize:12, fontWeight:700, color:'#A8DFC0' }}>{title}</div>
        {body && <div style={{ fontSize:11, color:'#65C285', marginTop:2 }}>{body}</div>}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-110%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </div>
  )
}