// controllers/itineraryController.js
import { generateOptions, generateItinerary } from '../services/geminiService.js'
import Trip from '../models/Trip.js'
import Plan from '../models/Plan.js'
import Itinerary from '../models/Itinerary.js'
import User from '../models/User.js'

/**
 * POST /api/generate-options
 * Body: { destination, departureDate, returnDate, budget, travelers, vibes }
 */
export async function generateOptionsHandler(req, res) {
  try {
    const tripData = req.body

    if (!tripData.destination || !tripData.departureDate || !tripData.returnDate) {
      return res.status(400).json({ error: 'destination, departureDate, and returnDate are required' })
    }

    const data = await generateOptions(tripData)

    let savedTripId = null

    if (req.user?.id) {
      // Check if trip already exists to avoid duplicates from StrictMode
      const existingTrip = await Trip.findOne({
        userId:      req.user.id,
        destination: tripData.destination,
        createdAt:   { $gte: new Date(Date.now() - 30000) } // within last 30 seconds
      })

      const trip = existingTrip || await Trip.create({
        userId:        req.user.id,
        destination:   tripData.destination,
        departureDate: tripData.departureDate,
        returnDate:    tripData.returnDate,
        budget:        tripData.budget,
        vibes:         tripData.vibes || [],
        travelers:     tripData.crewData || [],
        status:        'planning',
      })

      savedTripId = trip._id.toString()

      if (!existingTrip) {
        await User.findByIdAndUpdate(req.user.id, {
          $push: { tripHistory: trip._id }
        })
      }

      if (data?.options?.length) {
        // Delete old plans for this trip to avoid duplicates
        await Plan.deleteMany({ tripId: trip._id })

        const plans = await Plan.insertMany(
          data.options.map(option => ({
            tripId:               trip._id,
            userId:               req.user.id,
            optionId:             option.id,
            title:                option.title,
            estimatedTotalBudget: option.estimatedBudget,
            tripSummary:          option.summary,
          }))
        )

        data.options = data.options.map((opt, i) => ({
          ...opt,
          planId: plans[i]._id.toString(),
          tripId: savedTripId,
        }))
      }
    }

    // ✅ Send tripId at top level too
    return res.status(200).json({ ...data, tripId: savedTripId })

  } catch (err) {
    console.error('[generateOptions] FULL ERROR:', err)
    return res.status(500).json({ error: err.message || 'Failed to generate trip options.' })
  }
}

/**
 * POST /api/generate-itinerary
 * Body: { selectedOptionId, originalTripData, tripId, planId }
 */
export async function generateItineraryHandler(req, res) {
  try {
    const { selectedOptionId, originalTripData, tripId, planId } = req.body

    if (!selectedOptionId || !originalTripData) {
      return res.status(400).json({ error: 'selectedOptionId and originalTripData are required' })
    }

    // 1. Generate itinerary from Gemini
    const data = await generateItinerary(selectedOptionId, originalTripData)

    // 2. Save itinerary to DB if user is authenticated
    if (req.user?.id) {
      // ✅ Only save itinerary if tripId exists
      if (tripId) {
        const itinerary = await Itinerary.create({
          tripId:               tripId,
          userId:               req.user.id,
          planId:               planId || undefined,
          optionId:             selectedOptionId,
          estimatedTotalBudget: data.estimatedTotalBudget,
          tripSummary:          data.tripSummary,
          travelTips:           data.travelTips || [],
          dailyPlan:            data.dailyPlan || [],
          isSelected:           true,
        })
        data.itineraryId = itinerary._id

        if (planId) await Plan.findByIdAndUpdate(planId, { isSelected: true })
        await Trip.findByIdAndUpdate(tripId, { status: 'active' })
      }
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('[generateItinerary] Error:', err.message)
    return res.status(500).json({ error: 'Failed to generate itinerary.' })
  }
}