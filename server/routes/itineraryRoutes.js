import { Router } from 'express'
import { generateOptionsHandler, generateItineraryHandler } from '../controllers/itineraryController.js'

const router = Router()

// POST /api/generate-options
router.post('/generate-options', generateOptionsHandler)

// POST /api/generate-itinerary
router.post('/generate-itinerary', generateItineraryHandler)

export default router
