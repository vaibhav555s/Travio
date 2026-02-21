// controllers/planController.js
import Plan from '../models/Plan.js'
import Itinerary from '../models/Itinerary.js'
import Trip from '../models/Trip.js'

// ─── Get All Plans for a Trip ───────────────────────────────
export const getPlansByTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const plans = await Plan.find({ tripId: req.params.tripId })
      .sort({ createdAt: -1 })

    res.json(plans)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Get Single Plan ────────────────────────────────────────
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('tripId', 'destination departureDate returnDate budget')

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Select a Plan (mark as chosen) ────────────────────────
export const selectPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Deselect all other plans for this trip first
    await Plan.updateMany(
      { tripId: plan.tripId, _id: { $ne: plan._id } },
      { $set: { isSelected: false } }
    )

    // Select this plan
    plan.isSelected = true
    await plan.save()

    // Update trip status to active
    await Trip.findByIdAndUpdate(plan.tripId, { status: 'active' })

    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Get Selected Plan for a Trip ──────────────────────────
export const getSelectedPlan = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const plan = await Plan.findOne({
      tripId:     req.params.tripId,
      isSelected: true
    }).populate('tripId', 'destination departureDate returnDate budget travelers')

    if (!plan) {
      return res.status(404).json({ message: 'No selected plan found' })
    }

    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Get Itinerary for a Plan ───────────────────────────────
export const getItineraryByPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const itinerary = await Itinerary.findOne({ planId: req.params.id })

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found for this plan' })
    }

    res.json(itinerary)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Delete Plan ────────────────────────────────────────────
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' })
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await plan.deleteOne()

    res.json({ message: 'Plan deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}