import axios from 'axios'

const ROBOFLOW_KEY   = import.meta.env.VITE_ROBOFLOW_KEY
const ROBOFLOW_WS    = import.meta.env.VITE_ROBOFLOW_WORKSPACE
const ROBOFLOW_MODEL = import.meta.env.VITE_ROBOFLOW_MODEL
const ROBOFLOW_VER   = import.meta.env.VITE_ROBOFLOW_VERSION
const WEATHER_KEY    = import.meta.env.VITE_OPENWEATHER_KEY
const ANTHROPIC_KEY  = import.meta.env.VITE_ANTHROPIC_KEY

export async function diagnosePlant(imageBase64) {
  try {
    const res = await axios({
      method: 'POST',
      url: `https://detect.roboflow.com/${ROBOFLOW_MODEL}/${ROBOFLOW_VER}`,
      params: { api_key: ROBOFLOW_KEY },
      data: imageBase64,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return { success: true, data: res.data }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export async function getWeather(lat = 32.5, lon = 44.4) {
  try {
    const res = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      { params: { lat, lon, appid: WEATHER_KEY, units: 'metric', lang: 'ar' } }
    )
    const d = res.data
    return {
      success: true,
      data: {
        temp: Math.round(d.main.temp),
        humidity: d.main.humidity,
        description: d.weather[0].description,
        wind_speed: d.wind.speed,
        city: d.name
      }
    }
  } catch (e) {
    return { success: false }
  }
}

export async function askAssistant(message, history = []) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `أنت مساعد زراعي خبير متخصص في الزراعة العراقية.
تتحدث العربية والعامية العراقية بطلاقة.
تعرف المحاصيل العراقية: حنطة، شعير، تمر، طماطم، خيار، باذنجان، بصل، بطاطا.
إجاباتك مختصرة وعملية.`,
        messages: [...history, { role: 'user', content: message }]
      })
    })
    const data = await res.json()
    return { success: true, message: data.content[0].text }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export function calculateIrrigation({ cropType, area, soilType, season, stage }) {
  const base = { 'حنطة':3.5,'طماطم':5.5,'خيار':6,'نخيل':4,'شعير':3,'ذرة':5,'باذنجان':4.5,'بطاطا':4.8,'بصل':4.2,'فلفل':5.2,'رقي':5.8,'بطيخ':5.6,'تفاح':3.8,'رمان':3.5,'عنب':4.2,'تين':3.2,'مشمش':3.6,'برتقال':4.0,'ليمون':3.8,'فراولة':6.2,'فلفل حار':5.0,'كوسا':5.5,'لوبياء':4.5,'بازلاء':3.8,'عدس':2.8,'حمص':2.5,'سمسم':2.2,'زيتون':2.8,'قطن':4.5 }
  const sm   = { 'طمي':1,'طينية':.8,'رملية':1.3 }
  const seam = { 'صيف':1.5,'ربيع':1,'خريف':.9,'شتاء':.6 }
  const stm  = { 'نمو خضري':1,'بادرة':.7,'إزهار':1.2,'إثمار':1.3,'نضج':.8 }
  const daily = Math.round((base[cropType]||4)*area*(sm[soilType]||1)*(seam[season]||1)*(stm[stage]||1)*1000)
  const days  = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
  const tips  = { 'صيف':'اري في الفجر (5-7 ص) أو بعد الغروب.','ربيع':'الري صباحاً هو الأفضل.','خريف':'قلل الري تدريجياً.','شتاء':'الري في منتصف النهار أفضل.' }
  return {
    daily,
    savings: Math.round(30 + Math.random()*15),
    schedule: days.map(d => ({ day:d, amt:Math.round(daily*(.85+Math.random()*.3)), skip:Math.random()<.1 })),
    tip: tips[season] || tips['صيف']
  }
}