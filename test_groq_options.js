import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
})

const GROK_MODEL = 'llama-3.3-70b-versatile'

function extractJSON(text) {
    const clean = text.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim()
    return JSON.parse(clean)
}

async function testOptions() {
    const prompt = `You are an expert Indian travel planner. Analyze the following trip parameters and generate exactly 3 distinct route options.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "options": [
    {
      "id": "recommended",
      "title": "Recommended Route",
      "shortDescription": "One sentence describing this balanced route",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"]
    }
  ]
}
`

    try {
        const completion = await openai.chat.completions.create({
            model: GROK_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        })
        const text = completion.choices[0].message.content
        console.log("Raw Text:", text)
        const json = extractJSON(text)
        console.log("Parsed JSON Options:", json.options)
    } catch (err) {
        console.error("Error:", err)
    }
}

testOptions()
