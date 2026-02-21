import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'

const env = readFileSync('.env', 'utf8')
const key = env.match(/GEMINI_API_KEY=(.+)/)?.[1]?.trim()
console.log('Key found:', key ? key.substring(0, 15) + '...' : 'MISSING')

const g = new GoogleGenerativeAI(key)
const model = g.getGenerativeModel({ model: 'gemini-2.5-flash' })

try {
    const r = await model.generateContent('Reply with this exact JSON: {"msg":"hello"}')
    console.log('SUCCESS:', r.response.text().substring(0, 200))
} catch (e) {
    console.error('GEMINI ERROR:', e.message)
    console.error('STATUS:', e.status)
    console.error('STATUS CODE:', e.statusCode)
    console.error('FULL:', JSON.stringify(e, null, 2))
}
