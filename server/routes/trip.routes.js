// routes/trip.routes.js
import { Router } from 'express'
import {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  updateTripStatus,
  deleteTrip,
} from '../controllers/tripController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// All trip routes are protected
router.use(protect)

router.post('/',              createTrip)
router.get('/',               getUserTrips)
router.get('/:id',            getTripById)
router.put('/:id',            updateTrip)
router.patch('/:id/status',   updateTripStatus)
router.delete('/:id',         deleteTrip)

export default router