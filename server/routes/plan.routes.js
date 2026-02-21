// routes/plan.routes.js
import { Router } from 'express'
import {
  getPlansByTrip,
  getPlanById,
  selectPlan,
  getSelectedPlan,
  getItineraryByPlan,
  deletePlan,
} from '../controllers/planController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// All plan routes are protected
router.use(protect)

router.get('/trip/:tripId',          getPlansByTrip)
router.get('/trip/:tripId/selected', getSelectedPlan)
router.get('/:id',                   getPlanById)
router.get('/:id/itinerary',         getItineraryByPlan)
router.patch('/:id/select',          selectPlan)
router.delete('/:id',                deletePlan)

export default router