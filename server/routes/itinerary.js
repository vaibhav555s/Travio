import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

router.post('/refine', async (req, res) => {
    try {
        const { plan, userRequest } = req.body

        if (!plan || !userRequest) {
            return res.status(400).json({ error: 'Plan and userRequest are required.' })
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
You are a travel itinerary assistant. Given the following trip itinerary as JSON and a user's change request in natural language, return an updated version of the itinerary JSON with ONLY the requested modifications applied. All other data (name, tagline, badge, photo, accent, metrics, totalCost, nights, highlights, aiNote, id) should remain UNCHANGED. Only modify the "days" and "activities" arrays as per the user's request.

IMPORTANT: Return ONLY the raw JSON object. No markdown, no code fences, no explanation text. Just the pure JSON.

Current Itinerary JSON:
${JSON.stringify(plan, null, 2)}

User's change request: "${userRequest}"

Return the updated itinerary as a valid JSON object with the exact same schema.
`

        const result = await model.generateContent(prompt)
        const text = result.response.text()

        // Strip any accidental markdown fences
        const cleaned = text
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim()

        let refinedPlan
        try {
            refinedPlan = JSON.parse(cleaned)
        } catch (parseErr) {
            console.error('Gemini response was not valid JSON:', cleaned)
            return res.status(500).json({ error: 'Gemini returned an unexpected format. Please try again.' })
        }

        return res.json({ refinedPlan })
    } catch (err) {
        console.error('Itinerary refine error:', err)
        return res.status(500).json({ error: 'Failed to refine itinerary. Please try again.' })
    }
})

export default router
