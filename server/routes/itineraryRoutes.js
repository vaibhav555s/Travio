import { Router } from 'express'
import { generateOptionsHandler, generateItineraryHandler, refineItineraryHandler } from '../controllers/itineraryController.js'
import { protect, optionalAuth } from '../middleware/auth.js'

const router = Router()

// POST /api/itinerary/refine
router.post('/refine', refineItineraryHandler)
router.post('/generate-options', optionalAuth, generateOptionsHandler)
router.post('/generate-itinerary', optionalAuth, generateItineraryHandler)

export default router