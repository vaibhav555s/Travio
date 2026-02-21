import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/** Strip markdown code fences Gemini sometimes wraps around JSON */
function extractJSON(text) {
  const clean = text.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim()
  return JSON.parse(clean)
}

/** Retry a function up to maxAttempts times with exponential backoff */
async function withRetry(fn, maxAttempts = 3, baseDelayMs = 5000) {
  let lastError
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const isQuota = err.message?.includes('429') || err.message?.includes('quota') || err.status === 429
      if (!isQuota || attempt === maxAttempts) throw err
      const delay = baseDelayMs * attempt
      console.log(`[Gemini] Quota hit, retrying in ${delay / 1000}s... (attempt ${attempt}/${maxAttempts})`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastError
}

/** Get model — try gemini-2.0-flash first, fall back to gemini-1.5-flash */
function getModel(modelName = 'gemini-2.5-flash') {
  return genAI.getGenerativeModel({ model: modelName })
}

/**
 * Step 1 – Generate 3 distinct route options for the given trip parameters.
 */
export async function generateOptions(tripData) {
  const { destination, departureDate, returnDate, budget, travelers, vibes = [] } = tripData

  const prompt = `You are an expert Indian travel planner. Analyze the following trip parameters and generate exactly 3 distinct route options.

Trip Parameters:
- Destination: ${destination}
- Departure: ${departureDate}
- Return: ${returnDate}
- Budget (total in INR): Rs.${budget}
- Number of travelers: ${travelers}
- Travel vibes/interests: ${vibes.join(', ') || 'General'}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "options": [
    {
      "id": "recommended",
      "title": "Recommended Route",
      "shortDescription": "One sentence describing this balanced route",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"]
    },
    {
      "id": "high_energy",
      "title": "High Energy Adventure",
      "shortDescription": "One sentence describing this adventure route",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"]
    },
    {
      "id": "budget_friendly",
      "title": "Budget Friendly Plan",
      "shortDescription": "One sentence describing this budget route",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"]
    }
  ]
}

Rules: recommended = balanced; high_energy = adventure, up to 120% budget; budget_friendly = under 70% budget. All highlights must be real activities at ${destination}.`

  const model = getModel()
  return withRetry(async () => {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('[geminiService] Raw options response (first 300):', text.substring(0, 300))
    return extractJSON(text)
  })
}

/**
 * Step 2 – Generate full day-wise itinerary for a chosen route option.
 */
export async function generateItinerary(selectedOptionId, tripData) {
  const { destination, departureDate, returnDate, budget, travelers, vibes = [] } = tripData

  const start = new Date(departureDate)
  const end = new Date(returnDate)
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)

  const styleDescriptions = {
    recommended: 'Balanced and comfortable - mix of sightseeing, food, relaxation',
    high_energy: 'High-octane adventure - packed with activities, sports, and exploration',
    budget_friendly: 'Budget-conscious slow travel - local experiences, hidden gems, minimal costs',
  }
  const style = styleDescriptions[selectedOptionId] || styleDescriptions.recommended

  const prompt = `You are an expert Indian travel planner. Generate a detailed ${days}-day itinerary.

Trip Parameters:
- Destination: ${destination}
- Departure: ${departureDate}
- Return: ${returnDate}
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

  const model = getModel()
  return withRetry(async () => {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    console.log('[geminiService] Raw itinerary response (first 300):', text.substring(0, 300))
    return extractJSON(text)
  })
}
