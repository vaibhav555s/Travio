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

const BASE = '/api'

const TABS = ['My Trips', 'Shared', 'Invites']

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recentTrips, setRecentTrips] = useState([])
  const [sharedTrips, setSharedTrips] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [declining, setDeclining] = useState(null)
  const [activeTab, setActiveTab] = useState('My Trips')

  // ── Fetch all data — re-runs when user/session changes ──
  useEffect(() => {
    const fetchAll = async () => {
      // Read token fresh inside the effect — avoids stale closure when
      // AuthContext hasn't restored the session yet at first render
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.warn('[Dashboard] No token found in localStorage — skipping fetch')
        setTripsLoading(false)
        return
      }
      const authHeader = { Authorization: `Bearer ${token}` }
      try {
        console.log('[Dashboard] Fetching trips + invites...')
        const [ownRes, sharedRes, inviteRes] = await Promise.all([
          fetch(`${BASE}/trips`, { headers: authHeader }),
          fetch(`${BASE}/trips/shared`, { headers: authHeader }),
          fetch(`${BASE}/trips/invites`, { headers: authHeader }),
        ])
        console.log('[Dashboard] status — own:', ownRes.status, '| shared:', sharedRes.status, '| invites:', inviteRes.status)
        if (ownRes.ok) setRecentTrips(await ownRes.json())
        if (sharedRes.ok) setSharedTrips(await sharedRes.json())
        if (inviteRes.ok) {
          const inv = await inviteRes.json()
          console.log('[Dashboard] pending invites payload:', inv)
          setPendingInvites(inv)
        } else {
          const body = await inviteRes.text()
          console.error('[Dashboard] invites fetch failed:', inviteRes.status, body)
        }
      } catch (err) {
        console.error('[Dashboard] fetch error:', err)
      } finally {
        setTripsLoading(false)
      }
    }
    fetchAll()
    // Re-run when user is set by AuthContext (handles page reload case)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Accept invite ────────────────────────────────────
  const handleAccept = async (tripId) => {
    const token = localStorage.getItem('accessToken')
    const authHeader = { Authorization: `Bearer ${token}` }
    setAccepting(tripId)
    try {
      const res = await fetch(`${BASE}/trips/${tripId}/accept`, {
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
    } catch (err) { console.error('Accept failed:', err) }
    finally { setAccepting(null) }
  }

  // ── Decline invite ───────────────────────────────────
  const handleDecline = async (tripId) => {
    const token = localStorage.getItem('accessToken')
    const authHeader = { Authorization: `Bearer ${token}` }
    setDeclining(tripId)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const myId = payload.id || payload._id || payload.sub
      const res = await fetch(`${BASE}/trips/${tripId}/collaborators/${myId}`, {
        method: 'DELETE', headers: authHeader,
      })
      if (res.ok) setPendingInvites(prev => prev.filter(i => i.tripId !== tripId))
    } catch (err) { console.error('Decline failed:', err) }
    finally { setDeclining(null) }
  }

  const tripSetup = (() => { try { return JSON.parse(sessionStorage.getItem('tripSetupData') || '{}') } catch { return {} } })()
  const hasUpcoming = !!tripSetup.destination
  const firstName = user?.name?.split(' ')[0] || 'Traveler'

  // Merge DB trips + sessionStorage upcoming trip into one list for "My Trips" tab
  // (sessionStorage trip is shown as a card so users can always see their planned trip)
  const sessionTrip = hasUpcoming ? [{
    _id: tripSetup.tripId || 'session-trip',
    destination: tripSetup.destination,
    departureDate: tripSetup.departureDate,
    returnDate: tripSetup.returnDate,
    budget: tripSetup.budget,
    _fromSession: true,
  }] : []

  // Avoid duplicates: if a DB trip has the same destination + same tripId, don't show session trip
  const dbHasSessionTrip = recentTrips.some(t =>
    tripSetup.tripId && t._id === tripSetup.tripId
  )
  const allMyTrips = dbHasSessionTrip ? recentTrips : [...recentTrips, ...sessionTrip]

  // ── Stats ────────────────────────────────────────────
  const stats = [
    { icon: '🗺️', num: allMyTrips.length, label: 'My Trips' },
    { icon: '🤝', num: sharedTrips.length, label: 'Shared' },
    { icon: '📬', num: pendingInvites.length, label: 'Invites' },
    { icon: '✈️', num: hasUpcoming ? 1 : 0, label: 'Upcoming' },
  ]

  return (
    <motion.div
      className="ud-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* ═══════════════════════════════════
          HERO STRIP
      ═══════════════════════════════════ */}
      <div className="ud-hero">
        <div className="ud-hero-orb ud-hero-orb--a" />
        <div className="ud-hero-orb ud-hero-orb--b" />
        <div className="ud-hero-inner">
          <motion.div
            className="ud-hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <p className="ud-hero-eyebrow">✦ Your Journey Hub</p>
            <h1 className="ud-hero-greeting">Welcome back, {firstName} 👋</h1>
            <p className="ud-hero-sub">Pick up where you left off or start something new.</p>
          </motion.div>
          <motion.button
            className="ud-hero-btn"
            onClick={() => navigate('/setup')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            + Plan a New Trip
          </motion.button>
        </div>
      </div>

      <div className="ud-container">

        {/* ═══════════════════════════════════
            STATS ROW
        ═══════════════════════════════════ */}
        <motion.div className="ud-stats-row" variants={stagger} initial="hidden" animate="show">
          {stats.map(s => (
            <motion.div key={s.label} className="ud-stat-card" variants={fadeUp}>
              <span className="ud-stat-icon">{s.icon}</span>
              <span className="ud-stat-num">{tripsLoading ? '—' : s.num}</span>
              <span className="ud-stat-label">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══════════════════════════════════
            UPCOMING TRIP (from sessionStorage)
        ═══════════════════════════════════ */}
        {hasUpcoming && (
          <motion.div
            className="ud-upcoming-card"
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.12 }}
          >
            <div className="ud-upcoming-left">
              <span className="ud-status-badge">● PLANNED</span>
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
              <button className="ud-view-btn" onClick={() => navigate('/plans')}>
                View Trip →
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════
            TABBED CONTENT
        ═══════════════════════════════════ */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.18 }}>

          {/* Tab bar */}
          <div className="ud-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`ud-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === 'Invites' && pendingInvites.length > 0 && (
                  <span className="ud-tab-badge">{pendingInvites.length}</span>
                )}
                {activeTab === tab && (
                  <motion.div className="ud-tab-indicator" layoutId="tab-indicator" />
                )}
              </button>
            ))}
          </div>

          {/* ── My Trips tab ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'My Trips' && (
              <motion.div
                key="my-trips"
                className="ud-tab-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {tripsLoading ? (
                  <div className="ud-loading-row">
                    {[1, 2, 3].map(n => <div key={n} className="ud-skeleton" />)}
                  </div>
                ) : allMyTrips.length === 0 ? (
                  <div className="ud-empty">
                    No trips yet.{' '}
                    <button className="ud-empty-link" onClick={() => navigate('/setup')}>
                      Plan your first trip →
                    </button>
                  </div>
                ) : (
                  <motion.div className="ud-scroll-row" variants={stagger} initial="hidden" animate="show">
                    {allMyTrips.map(trip => (
                      <motion.div key={trip._id} variants={fadeUp}>
                        <TripCard
                          destination={trip.destination}
                          dates={`${trip.departureDate?.slice?.(0, 10)} → ${trip.returnDate?.slice?.(0, 10)}`}
                          budget={Number(trip.budget || 0).toLocaleString()}
                          badge="owner"
                          onOpen={() => navigate('/plans')}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── Shared tab ── */}
            {activeTab === 'Shared' && (
              <motion.div
                key="shared"
                className="ud-tab-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {tripsLoading ? (
                  <div className="ud-loading-row">
                    {[1, 2].map(n => <div key={n} className="ud-skeleton" />)}
                  </div>
                ) : sharedTrips.length === 0 ? (
                  <div className="ud-empty">
                    No shared trips yet. Accept an invite to see them here.
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
            )}

            {/* ── Invites tab ── */}
            {activeTab === 'Invites' && (
              <motion.div
                key="invites"
                className="ud-tab-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {tripsLoading ? (
                  <div className="ud-empty">Checking for invites…</div>
                ) : pendingInvites.length === 0 ? (
                  <div className="ud-empty">
                    🎉 No pending invites right now. When someone invites you to their trip, it'll appear here.
                  </div>
                ) : (
                  <div className="ud-invites-list">
                    <AnimatePresence>
                      {pendingInvites.map(invite => (
                        <motion.div
                          key={String(invite.tripId)}
                          className="ud-invite-card"
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16, transition: { duration: 0.22 } }}
                          layout
                        >
                          <div className="ud-invite-left">
                            <div className="ud-invite-icon">✈️</div>
                            <div>
                              <p className="ud-invite-dest">{invite.destination}</p>
                              <p className="ud-invite-dates">
                                {invite.departureDate?.slice?.(0, 10)} → {invite.returnDate?.slice?.(0, 10)}
                              </p>
                            </div>
                          </div>
                          <div className="ud-invite-actions">
                            <button
                              className="ud-invite-btn accept"
                              onClick={() => handleAccept(String(invite.tripId))}
                              disabled={accepting === String(invite.tripId) || declining === String(invite.tripId)}
                            >
                              {accepting === String(invite.tripId)
                                ? <span className="ud-spinner" />
                                : '✓ Accept'}
                            </button>
                            <button
                              className="ud-invite-btn decline"
                              onClick={() => handleDecline(String(invite.tripId))}
                              disabled={accepting === String(invite.tripId) || declining === String(invite.tripId)}
                            >
                              {declining === String(invite.tripId)
                                ? <span className="ud-spinner" />
                                : 'Decline'}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══════════════════════════════════
            TEAMS (restored)
        ═══════════════════════════════════ */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.28 }}>
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
