import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
})

const GROK_MODEL = 'llama-3.3-70b-versatile'

function extractJSON(text) {
    try {
        let clean = text.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim()
        const startIndex = clean.indexOf('{')
        const endIndex = clean.lastIndexOf('}')
        if (startIndex !== -1 && endIndex !== -1) {
            clean = clean.substring(startIndex, endIndex + 1)
        }
        return JSON.parse(clean)
    } catch (err) {
        console.error("Failed to parse JSON:", err.message)
        console.error("Raw text was:", text)
        throw new Error("Llama output was not valid JSON")
    }
}

async function testItinerary() {
    const days = 3;
    const source = "Mumbai";
    const destination = "Manali";
    const budget = "25000";
    const travelers = 2;
    const vibes = ["Nature", "Adventure"];
    const style = "Balanced and comfortable - mix of sightseeing, food, relaxation";

    const prompt = `You are an expert Indian travel planner. Generate a detailed ${days}-day itinerary.

Trip Parameters:
- Starting From: ${source || 'Not specified'}
- Destination: ${destination}
- Departure: 2026-03-01
- Return: 2026-03-03
- Total Budget (INR): Rs.${budget}
- Travelers: ${travelers}
- Vibes: ${vibes.join(', ') || 'General'}
- Style: ${style}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "tripSummary": "2-3 sentence overview",
  "dailyPlan": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00",
          "activity": "Activity name",
          "location": "Specific place",
          "costEstimate": "Rs.500"
        }
      ]
    }
  ],
  "estimatedTotalBudget": "Rs.28,000",
  "travelTips": ["Tip 1", "Tip 2", "Tip 3"]
}

Rules: Include exactly ${days} day objects. Each day: 3-5 activities, real 24h times. Costs in INR using Rs. symbol. estimatedTotalBudget = total for all ${travelers} travelers. travelTips must be specific to ${destination}.`

    try {
        const completion = await openai.chat.completions.create({
            model: GROK_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        })
        const text = completion.choices[0].message.content
        console.log("Raw Text snippet:", text.substring(0, 500))
        const json = extractJSON(text)
        console.log("Parsed JSON:", JSON.stringify(json, null, 2))
    } catch (err) {
        console.error("Error:", err)
    }
}

testItinerary()
