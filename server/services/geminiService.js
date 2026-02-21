import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY, /* actually a Groq key (gsk_...) */
  baseURL: 'https://api.groq.com/openai/v1',
})

const GROK_MODEL = 'llama-3.1-8b-instant'

function extractJSON(text) {
  try {
    // Strip markdown code fences if present
    let clean = text.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim()

    // Find the first { and last } to ensure we only parse the JSON object
    const startIndex = clean.indexOf('{')
    const endIndex = clean.lastIndexOf('}')

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response")
    }

    clean = clean.substring(startIndex, endIndex + 1)

    // Remove any trailing commas that some models add before the closing brace
    clean = clean.replace(/,\s*([}\]])/g, '$1')

    return JSON.parse(clean)
  } catch (err) {
    console.error("--- JSON PARSE FAILURE ---")
    console.error("Error:", err.message)
    console.error("Raw Text:", text)
    console.error("--------------------------")
    throw new Error("AI output was not valid JSON")
  }
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



/**
 * Step 1 – Generate 3 distinct route options for the given trip parameters.
 */
export async function generateOptions(tripData) {
  const { source, destination, departureDate, returnDate, budget, travelers, vibes = [], crewProfiles = [] } = tripData

  // Format crew profiles for the prompt
  const crewSummary = crewProfiles.length > 0
    ? crewProfiles.map((t, i) =>
      `  Traveler ${i + 1}: ${t.name || `T${i + 1}`}, Age: ${t.age || 'unknown'}, Interests: ${(t.interests || []).join(', ') || 'none specified'}`
    ).join('\n')
    : `  ${travelers} traveler(s), no detailed profiles`

  const prompt = `You are an expert Indian travel planner. Analyze the following trip parameters and generate exactly 3 distinct route options.

Trip Parameters:
- Starting From: ${source || 'Not specified'}
- Destination: ${destination}
- Departure: ${departureDate}
- Return: ${returnDate}
- Budget (total in INR): Rs.${budget}
- Number of travelers: ${travelers}
- Travel vibes/interests: ${vibes.join(', ') || 'General'}
- Crew Profiles:
${crewSummary}

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

  return withRetry(async () => {
    try {
      const completion = await openai.chat.completions.create({
        model: GROK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1, // Lower temperature for more consistent JSON
        response_format: { type: 'json_object' },
        max_tokens: 4000
      })
      const text = completion.choices[0].message.content
      console.log('[grokService] Raw options response (first 300):', text.substring(0, 300))
      return extractJSON(text)
    } catch (err) {
      console.error('[grokService] API Error:', err.response?.data || err.message)
      throw err
    }
  })
}

/**
 * Step 2 – Generate full day-wise itinerary for a chosen route option.
 */
export async function generateItinerary(selectedOptionId, tripData) {
  const { source, destination, departureDate, returnDate, budget, travelers, vibes = [] } = tripData

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
- Starting From: ${source || 'Not specified'}
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

  return withRetry(async () => {
    const completion = await openai.chat.completions.create({
      model: GROK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 6000
    })
    const text = completion.choices[0].message.content
    console.log('[grokService] Raw itinerary response (first 300):', text.substring(0, 300))
    return extractJSON(text)
  })
}

/** Tweak an existing itinerary based on a user prompt */
export async function refineItinerary(plan, userRequest) {
  const prompt = `You are an expert Indian travel planner. The user wants to tweak their existing itinerary.
  
Original Plan:
${JSON.stringify(plan, null, 2)}

User Request: "${userRequest}"

Please modify the Original Plan to accommodate the User Request. Keep the EXACT same JSON structure (tripSummary, estimatedTotalBudget, dailyPlan / days, travelTips), but update the days and activities as requested. 

Also add a new root-level string property called "aiNote" briefly explaining what you changed (e.g. "I replaced the morning hike with a yoga session on Day 2.").

Return ONLY valid JSON (no markdown, no conversation).`

  return withRetry(async () => {
    const completion = await openai.chat.completions.create({
      model: GROK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 6000
    })
    const text = completion.choices[0].message.content
    console.log('[grokService] Raw refine response (first 300):', text.substring(0, 300))
    return extractJSON(text)
  })
}
