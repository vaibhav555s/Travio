// controllers/collaboratorController.js
import Trip from '../models/Trip.js'
import User from '../models/User.js'

// ─── Helper ────────────────────────────────────────────────
const isOwner = (trip, userId) => trip.userId.toString() === userId

const isAcceptedCollaborator = (trip, userId) =>
    trip.collaborators.some(
        c => c.userId?.toString() === userId && c.status === 'accepted'
    )

const hasAccess = (trip, userId) =>
    isOwner(trip, userId) || isAcceptedCollaborator(trip, userId)

// ─── Invite Collaborator ────────────────────────────────────
// POST /api/trips/:id/invite   { email }
export const inviteCollaborator = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ message: 'email is required' })

        const trip = await Trip.findById(req.params.id)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })
        if (!isOwner(trip, req.user.id))
            return res.status(403).json({ message: 'Only the trip owner can invite collaborators' })

        // Don't add yourself
        if (email.toLowerCase() === req.user.email?.toLowerCase())
            return res.status(400).json({ message: 'You cannot invite yourself' })

        // Look up the user by email
        const invitee = await User.findOne({ email: email.toLowerCase().trim() })
        if (!invitee)
            return res.status(404).json({ message: 'No account found with this email. Ask them to sign up first.' })

        // Check if already a collaborator (any status)
        const alreadyAdded = trip.collaborators.some(
            c => c.userId?.toString() === invitee._id.toString()
        )
        if (alreadyAdded)
            return res.status(409).json({ message: 'This person has already been invited' })

        trip.collaborators.push({
            userId: invitee._id,
            email: invitee.email,
            name: invitee.name,
            status: 'pending',
            invitedAt: new Date(),
        })

        await trip.save()

        const newCollab = trip.collaborators[trip.collaborators.length - 1]
        return res.status(201).json({ success: true, collaborator: newCollab })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// ─── Accept Invite ──────────────────────────────────────────
// POST /api/trips/:id/accept
export const acceptInvite = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })

        const entry = trip.collaborators.find(
            c => c.userId?.toString() === req.user.id && c.status === 'pending'
        )
        if (!entry)
            return res.status(404).json({ message: 'No pending invite found for you on this trip' })

        entry.status = 'accepted'
        await trip.save()

        return res.json({ success: true, status: 'accepted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// ─── Decline / Remove Collaborator ─────────────────────────
// DELETE /api/trips/:id/collaborators/:userId
export const removeCollaborator = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })

        // Owner can remove anyone; collaborator can remove themselves
        const requestingUserId = req.user.id
        const targetUserId = req.params.userId

        if (!isOwner(trip, requestingUserId) && requestingUserId !== targetUserId)
            return res.status(403).json({ message: 'Not authorized' })

        const before = trip.collaborators.length
        trip.collaborators = trip.collaborators.filter(
            c => c.userId?.toString() !== targetUserId
        )

        if (trip.collaborators.length === before)
            return res.status(404).json({ message: 'Collaborator not found on this trip' })

        await trip.save()
        return res.json({ success: true })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// ─── Get Trips Shared With Me ────────────────────────────────
// GET /api/trips/shared
export const getSharedTrips = async (req, res) => {
    try {
        const trips = await Trip.find({
            'collaborators': {
                $elemMatch: {
                    userId: req.user.id,
                    status: 'accepted',
                }
            }
        }).sort({ createdAt: -1 })

        return res.json(trips)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// ─── Get Pending Invites For Me ──────────────────────────────
// GET /api/trips/invites
export const getMyInvites = async (req, res) => {
    try {
        const trips = await Trip.find({
            'collaborators': {
                $elemMatch: {
                    userId: req.user.id,
                    status: 'pending',
                }
            }
        }).sort({ createdAt: -1 })

        // Return only the relevant collaborator entry + trip info
        const invites = trips.map(trip => ({
            tripId: trip._id,
            destination: trip.destination,
            departureDate: trip.departureDate,
            returnDate: trip.returnDate,
            budget: trip.budget,
            ownerId: trip.userId,
        }))

        return res.json(invites)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// ─── Get Collaborators for a Trip ───────────────────────────
// GET /api/trips/:id/collaborators
export const getTripCollaborators = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
        if (!trip) return res.status(404).json({ message: 'Trip not found' })

        if (!hasAccess(trip, req.user.id))
            return res.status(403).json({ message: 'Not authorized' })

        return res.json(trip.collaborators)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
