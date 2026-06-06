export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.json()
  const GEMINI_KEY = process.env.VITE_GEMINI_KEY

  const messages = body.messages || []
  const systemPrompt = body.system || ''

  // تأكد أن contents ليس فارغاً
  let contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))

  // إذا فارغ أضف رسالة افتراضية
  if (contents.length === 0) {
    contents = [{ role: 'user', parts: [{ text: 'مرحبا' }] }]
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents
      })
    }
  )

  const data = await res.json()
  console.log('Gemini response:', JSON.stringify(data))
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
               data.error?.message || 
               'عذراً، حدث خطأ.'

  return new Response(JSON.stringify({
    content: [{ text }]
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}