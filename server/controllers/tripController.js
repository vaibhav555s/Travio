// controllers/tripController.js
import Trip from '../models/Trip.js'
import User from '../models/User.js'

// ─── Create Trip ────────────────────────────────────────────
export const createTrip = async (req, res) => {
  try {
    const { destination, departureDate, returnDate, budget, vibes, travelers } = req.body

    if (!destination || !departureDate || !returnDate || !budget) {
      return res.status(400).json({ message: 'destination, departureDate, returnDate and budget are required' })
    }

    const trip = await Trip.create({
      userId: req.user.id,
      destination,
      departureDate,
      returnDate,
      budget,
      vibes: vibes || [],
      travelers: travelers || [],
      status: 'planning',
    })

    // Link to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { tripHistory: trip._id }
    })

    res.status(201).json(trip)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Get All Trips for User ─────────────────────────────────
export const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id })
      .sort({ createdAt: -1 })

    res.json(trips)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Get Single Trip ────────────────────────────────────────
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    // Allow: trip owner OR accepted collaborator
    const requesterId = req.user.id
    const tripOwner = trip.userId.toString() === requesterId
    const isCollab = trip.collaborators.some(
      c => c.userId?.toString() === requesterId && c.status === 'accepted'
    )

    if (!tripOwner && !isCollab) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    res.json(trip)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Update Trip ────────────────────────────────────────────
export const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const updated = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Update Trip Status ─────────────────────────────────────
export const updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!['planning', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    trip.status = status
    await trip.save()

    res.json(trip)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Delete Trip ────────────────────────────────────────────
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await trip.deleteOne()

    // Remove from user's tripHistory
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { tripHistory: trip._id }
    })

    res.json({ message: 'Trip deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}