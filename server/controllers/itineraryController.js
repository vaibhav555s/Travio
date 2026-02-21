import { generateOptions, generateItinerary, refineItinerary } from '../services/geminiService.js'
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
        userId: req.user.id,
        destination: tripData.destination,
        createdAt: { $gte: new Date(Date.now() - 30000) } // within last 30 seconds
      })

      const trip = existingTrip || await Trip.create({
        userId: req.user.id,
        destination: tripData.destination,
        departureDate: tripData.departureDate,
        returnDate: tripData.returnDate,
        budget: tripData.budget,
        vibes: tripData.vibes || [],
        travelers: tripData.crewData || [],
        status: 'planning',
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
            tripId: trip._id,
            userId: req.user.id,
            optionId: option.id,
            title: option.title,
            estimatedTotalBudget: option.estimatedBudget,
            tripSummary: option.summary,
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
  console.log('[generateItineraryHandler] Request received:', req.body.selectedOptionId)
  try {
    const { selectedOptionId, originalTripData, tripId, planId } = req.body

    if (!selectedOptionId || !originalTripData) {
      return res.status(400).json({ error: 'selectedOptionId and originalTripData are required' })
    }

    // 1. Generate itinerary from AI
    const data = await generateItinerary(selectedOptionId, originalTripData)

    // 2. Save itinerary to DB if user is authenticated
    if (req.user?.id) {
      const mongoose = (await import('mongoose')).default

      // ✅ Only save itinerary if tripId and planId are valid ObjectIds
      const isValidTrip = tripId && mongoose.Types.ObjectId.isValid(tripId)
      const isValidPlan = planId && mongoose.Types.ObjectId.isValid(planId)

      if (isValidTrip) {
        const itinerary = await Itinerary.create({
          tripId: tripId,
          userId: req.user.id,
          planId: isValidPlan ? planId : undefined,
          optionId: selectedOptionId,
          estimatedTotalBudget: data.estimatedTotalBudget,
          tripSummary: data.tripSummary,
          travelTips: data.travelTips || [],
          dailyPlan: data.dailyPlan || [],
          isSelected: true,
        })
        data.itineraryId = itinerary._id

        if (isValidPlan) {
          await Plan.findByIdAndUpdate(planId, { isSelected: true })
        }
        await Trip.findByIdAndUpdate(tripId, { status: 'active' })
      } else {
        console.warn('[generateItinerary] Skipping DB save: Invalid tripId', tripId)
      }
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('[generateItinerary] Error:', err)
    return res.status(500).json({
      error: 'Failed to generate itinerary.',
      message: err.message,
      stack: err.stack
    })
  }
}

/**
 * POST /api/itinerary/refine
 * Body: { plan, userRequest }
 */
export async function refineItineraryHandler(req, res) {
  try {
    const { plan, userRequest } = req.body
    if (!plan || !userRequest) {
      return res.status(400).json({ error: 'plan and userRequest are required' })
    }

    const data = await refineItinerary(plan, userRequest)

    const determineDaysKeys = () => {
      if (data.dailyPlan?.length > 0) return data.dailyPlan;
      if (data.itinerary?.length > 0) return data.itinerary;
      if (data.days?.length > 0) return data.days;
      if (data.daily_plan?.length > 0) return data.daily_plan;

      // If the AI somehow returned an object instead of array, or nothing valid, fallback to old plan
      return plan.days;
    };

    const newPlan = {
      ...plan,
      tagline: data.tripSummary || data.tagline || plan.tagline,
      totalCost: data.estimatedTotalBudget || data.totalCost || plan.totalCost,
      days: determineDaysKeys(),
      travelTips: data.travelTips || plan.travelTips,
      aiNote: data.aiNote
    }

    return res.status(200).json({ refinedPlan: newPlan })
  } catch (err) {
    console.error('[refineItinerary] Error:', err.message)
    return res.status(500).json({ error: 'Failed to refine itinerary. Please try again.' })
  }
}
