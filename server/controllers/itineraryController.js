import { generateOptions, generateItinerary } from '../services/geminiService.js'

/**
 * POST /api/generate-options
 * Body: { destination, departureDate, returnDate, budget, travelers, vibes }
 */
export async function generateOptionsHandler(req, res) {
    try {
        const tripData = req.body
        console.log('[generateOptions] Received:', JSON.stringify(tripData))
        if (!tripData.destination || !tripData.departureDate || !tripData.returnDate) {
            return res.status(400).json({ error: 'destination, departureDate, and returnDate are required' })
        }

        const data = await generateOptions(tripData)
        console.log('[generateOptions] Success, options count:', data?.options?.length)
        return res.status(200).json(data)
    } catch (err) {
        console.error('[generateOptions] FULL ERROR:', err)
        return res.status(500).json({ error: err.message || 'Failed to generate trip options. Please try again.' })
    }
}

/**
 * POST /api/generate-itinerary
 * Body: { selectedOptionId, originalTripData }
 */
export async function generateItineraryHandler(req, res) {
    try {
        const { selectedOptionId, originalTripData } = req.body
        if (!selectedOptionId || !originalTripData) {
            return res.status(400).json({ error: 'selectedOptionId and originalTripData are required' })
        }

        const data = await generateItinerary(selectedOptionId, originalTripData)
        return res.status(200).json(data)
    } catch (err) {
        console.error('[generateItinerary] Error:', err.message)
        return res.status(500).json({ error: 'Failed to generate itinerary. Please try again.' })
    }
}
