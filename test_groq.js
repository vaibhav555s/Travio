import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' }) // Ensure it hits the root env

const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY, /* Groq key */
    baseURL: 'https://api.groq.com/openai/v1',
})

const GROK_MODEL = 'llama-3.3-70b-versatile'

async function testOptions() {
    const prompt = `You are an expert Indian travel planner. Return ONLY valid JSON with 3 options.`

    try {
        console.log("Calling Groq...")
        const completion = await openai.chat.completions.create({
            model: GROK_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        })
        console.log("Raw Response:")
        console.dir(completion, { depth: null })
        if (completion.choices && completion.choices.length > 0) {
            console.log("Content:", completion.choices[0].message.content)
        } else {
            console.log("No choices returned!")
        }
    } catch (err) {
        console.error("API Error caught:", err.message)
        console.error("Response data:", err.response?.data)
    }
}

testOptions()
