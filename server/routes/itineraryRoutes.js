import { Router } from 'express'
import { generateOptionsHandler, generateItineraryHandler, refineItineraryHandler } from '../controllers/itineraryController.js'
import { generateOptionsHandler, generateItineraryHandler } from '../controllers/itineraryController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// optionalAuth - attaches user if token exists, but doesn't block if not
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return protect(req, res, next)  // sets req.user if valid
  }
  next()  // continues without req.user
}

// POST /api/generate-itinerary
router.post('/generate-itinerary', generateItineraryHandler)
// POST /api/itinerary/refine
router.post('/itinerary/refine', refineItineraryHandler)
router.post('/generate-options',   optionalAuth, generateOptionsHandler)
router.post('/generate-itinerary', optionalAuth, generateItineraryHandler)

export default router