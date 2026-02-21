import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TripCard from '../components/TripCard'
import TeamCard from '../components/TeamCard'
import { useState, useEffect } from 'react'
import './UserDashboard.css'

const mockTeams = [
  { id: '1', name: 'Weekend Warriors', memberCount: 4, tripCount: 2 },
  { id: '2', name: 'Road Runners', memberCount: 2, tripCount: 1 },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500'

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recentTrips, setRecentTrips] = useState([])
  const [sharedTrips, setSharedTrips] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [declining, setDeclining] = useState(null)

  const token = localStorage.getItem('accessToken')
  const authHeader = { Authorization: `Bearer ${token}` }

  // ── Fetch all data on mount ──────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      if (!token) { setTripsLoading(false); return }
      try {
        const [ownRes, sharedRes, inviteRes] = await Promise.all([
          fetch(`${API_URL}/api/trips`, { headers: authHeader }),
          fetch(`${API_URL}/api/trips/shared`, { headers: authHeader }),
          fetch(`${API_URL}/api/trips/invites`, { headers: authHeader }),
        ])
        if (ownRes.ok) setRecentTrips(await ownRes.json())
        if (sharedRes.ok) setSharedTrips(await sharedRes.json())
        if (inviteRes.ok) setPendingInvites(await inviteRes.json())
      } catch (err) {
        console.error('Failed to fetch trips:', err)
      } finally {
        setTripsLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Accept invite ────────────────────────────────────
  const handleAccept = async (tripId) => {
    setAccepting(tripId)
    try {
      const res = await fetch(`${API_URL}/api/trips/${tripId}/accept`, {
        method: 'POST', headers: authHeader,
      })
      if (res.ok) {
        const accepted = pendingInvites.find(i => i.tripId === tripId)
        setPendingInvites(prev => prev.filter(i => i.tripId !== tripId))
        if (accepted) {
          setSharedTrips(prev => [...prev, {
            _id: accepted.tripId,
            destination: accepted.destination,
            departureDate: accepted.departureDate,
            returnDate: accepted.returnDate,
            budget: accepted.budget,
          }])
        }
      }
    } catch (err) {
      console.error('Accept failed:', err)
    } finally {
      setAccepting(null)
    }
  }

  // ── Decline invite ───────────────────────────────────
  const handleDecline = async (tripId) => {
    setDeclining(tripId)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const myId = payload.id || payload._id || payload.sub
      const res = await fetch(`${API_URL}/api/trips/${tripId}/collaborators/${myId}`, {
        method: 'DELETE', headers: authHeader,
      })
      if (res.ok) setPendingInvites(prev => prev.filter(i => i.tripId !== tripId))
    } catch (err) {
      console.error('Decline failed:', err)
    } finally {
      setDeclining(null)
    }
  }

  const tripSetup = (() => { try { return JSON.parse(sessionStorage.getItem('tripSetupData') || '{}') } catch { return {} } })()
  const hasUpcoming = !!tripSetup.destination
  const firstName = user?.name?.split(' ')[0] || 'Traveler'

  return (
    <motion.div
      className="user-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="ud-container">

        {/* ── Welcome Header ── */}
        <motion.div className="ud-header" variants={fadeUp} initial="hidden" animate="show">
          <p className="ud-eyebrow">Your Journey</p>
          <h1 className="ud-greeting">Welcome back, {firstName} 👋</h1>
          <p className="ud-subtitle">Let's continue your adventure.</p>
          <div className="ud-header-divider" />
        </motion.div>

        {/* ── Pending Invites — only shown when there are pending invites ── */}
        <AnimatePresence>
          {!tripsLoading && pendingInvites.length > 0 && (
            <motion.div
              variants={fadeUp} initial="hidden" animate="show"
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.05 }}
            >
              <div className="ud-invites-header">
                <p className="ud-section-title" style={{ margin: 0 }}>Trip Invites</p>
                <span className="ud-invite-badge">{pendingInvites.length} pending</span>
              </div>

              <div className="ud-invites-list">
                <AnimatePresence>
                  {pendingInvites.map(invite => (
                    <motion.div
                      key={invite.tripId}
                      className="ud-invite-card"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16, transition: { duration: 0.22 } }}
                    >
                      <div className="ud-invite-left">
                        <div className="ud-invite-icon">✈️</div>
                        <div>
                          <p className="ud-invite-dest">{invite.destination}</p>
                          <p className="ud-invite-dates">
                            {invite.departureDate?.slice(0, 10)} → {invite.returnDate?.slice(0, 10)}
                          </p>
                        </div>
                      </div>

                      <div className="ud-invite-actions">
                        <button
                          className="ud-invite-btn accept"
                          onClick={() => handleAccept(invite.tripId)}
                          disabled={accepting === invite.tripId || declining === invite.tripId}
                        >
                          {accepting === invite.tripId
                            ? <span className="ud-invite-spinner" />
                            : '✓ Accept'}
                        </button>
                        <button
                          className="ud-invite-btn decline"
                          onClick={() => handleDecline(invite.tripId)}
                          disabled={accepting === invite.tripId || declining === invite.tripId}
                        >
                          {declining === invite.tripId
                            ? <span className="ud-invite-spinner" />
                            : 'Decline'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Upcoming Trip ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <p className="ud-section-title">Upcoming Trip</p>
          {hasUpcoming ? (
            <div className="ud-upcoming-card">
              <div className="ud-upcoming-left">
                <h2 className="ud-upcoming-dest">📍 {tripSetup.destination}</h2>
                <div className="ud-upcoming-meta">
                  {tripSetup.departureDate && (
                    <span className="ud-meta-item">📅 {tripSetup.departureDate} → {tripSetup.returnDate}</span>
                  )}
                  {tripSetup.budget && (
                    <span className="ud-meta-item">💰 ₹{Number(tripSetup.budget).toLocaleString()}</span>
                  )}
                  {tripSetup.travelers && (
                    <span className="ud-meta-item">👥 {tripSetup.travelers} traveler{tripSetup.travelers > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
              <div className="ud-upcoming-right">
                <span className="ud-status-badge">● PLANNED</span>
                <button className="ud-view-btn" onClick={() => navigate('/plans')}>
                  View Trip →
                </button>
              </div>
            </div>
          ) : (
            <div className="ud-empty">
              No trip planned yet.{' '}
              <button style={{ background: 'none', border: 'none', color: '#E8631A', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/setup')}>
                Plan one now →
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Recent Trips ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.18 }}>
          <p className="ud-section-title">Recent Trips</p>
          {tripsLoading ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading trips...</p>
          ) : recentTrips.length === 0 ? (
            <div className="ud-empty">
              No trips yet.{' '}
              <button style={{ background: 'none', border: 'none', color: '#E8631A', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/setup')}>
                Plan your first trip →
              </button>
            </div>
          ) : (
            <motion.div className="ud-scroll-row" variants={stagger} initial="hidden" animate="show">
              {recentTrips.map(trip => (
                <motion.div key={trip._id} variants={fadeUp}>
                  <TripCard
                    destination={trip.destination}
                    dates={`${trip.departureDate?.slice(0, 10)} → ${trip.returnDate?.slice(0, 10)}`}
                    budget={Number(trip.budget).toLocaleString()}
                    badge="owner"
                    onOpen={() => navigate('/plans')}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ── Shared With Me ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.26 }}>
          <p className="ud-section-title">Shared With Me</p>
          {tripsLoading ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
          ) : sharedTrips.length === 0 ? (
            <div className="ud-empty">
              No shared trips yet. Accept an invite above to see trips shared with you.
            </div>
          ) : (
            <motion.div className="ud-scroll-row" variants={stagger} initial="hidden" animate="show">
              {sharedTrips.map(trip => (
                <motion.div key={trip._id} variants={fadeUp}>
                  <TripCard
                    destination={trip.destination}
                    dates={`${trip.departureDate?.slice(0, 10)} → ${trip.returnDate?.slice(0, 10)}`}
                    budget={Number(trip.budget).toLocaleString()}
                    badge="collaborator"
                    onOpen={() => navigate('/plans')}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ── Teams ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.32 }}>
          <p className="ud-section-title">Your Teams</p>
          <motion.div className="ud-grid" variants={stagger} initial="hidden" animate="show">
            {mockTeams.map(team => (
              <motion.div key={team.id} variants={fadeUp}>
                <TeamCard id={team.id} name={team.name} memberCount={team.memberCount} tripCount={team.tripCount} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  )
}
