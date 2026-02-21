import { Router } from 'express'
import { generateOptionsHandler, generateItineraryHandler, refineItineraryHandler } from '../controllers/itineraryController.js'

const router = Router()

// POST /api/generate-options
router.post('/generate-options', generateOptionsHandler)

// POST /api/generate-itinerary
router.post('/generate-itinerary', generateItineraryHandler)
// POST /api/itinerary/refine
router.post('/itinerary/refine', refineItineraryHandler)

export default router
