// routes/collaborator.routes.js
import { Router } from 'express'
import {
    inviteCollaborator,
    acceptInvite,
    removeCollaborator,
    getSharedTrips,
    getMyInvites,
    getTripCollaborators,
} from '../controllers/collaboratorController.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)

// Shared / invite listing routes (no :id)
router.get('/shared', getSharedTrips)
router.get('/invites', getMyInvites)

// Per-trip collaborator routes
router.get('/:id/collaborators', getTripCollaborators)
router.post('/:id/invite', inviteCollaborator)
router.post('/:id/accept', acceptInvite)
router.delete('/:id/collaborators/:userId', removeCollaborator)

export default router
