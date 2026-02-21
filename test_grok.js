import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.xai.com/v1',
})

async function test() {
    try {
        const completion = await openai.chat.completions.create({
            model: 'grok-2-latest',
            messages: [{ role: 'user', content: 'Say hello' }],
            temperature: 0.7,
        })
        console.log("Success:", JSON.stringify(completion, null, 2))
    } catch (err) {
        console.error("Error:", err.message)
        console.error("Details:", err.response?.data)
    }
}

test()
