import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import './UserDashboard.css'

/* ─── Animation variants ─────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] } },
}

/* ─── Unsplash image map (destination → keyword) ─── */
const DEST_IMAGES = {
  default: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=400&fit=crop',
  manali: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  ladakh: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop',
  kerala: 'https://images.unsplash.com/photo-1598977740148-c5cc4c0e78b4?w=600&h=400&fit=crop',
  coorg: 'https://images.unsplash.com/photo-1544161513-0179fe746fd5?w=600&h=400&fit=crop',
}
const getDestImg = (dest = '') => {
  const key = dest.toLowerCase().trim()
  return Object.entries(DEST_IMAGES).find(([k]) => k !== 'default' && key.includes(k))?.[1] ?? DEST_IMAGES.default
}

const TABS = ['My Trips', 'Shared', 'Invites']

const BASE = '/api'

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

  const token = localStorage.getItem('accessToken')
  const authHeader = { Authorization: `Bearer ${token}` }

  /* ── Fetch all data ─────────────────────── */
  useEffect(() => {
    const fetchAll = async () => {
      if (!token) { setTripsLoading(false); return }
      try {
        const [ownRes, sharedRes, inviteRes] = await Promise.all([
          fetch(`${BASE}/trips`, { headers: authHeader }),
          fetch(`${BASE}/trips/shared`, { headers: authHeader }),
          fetch(`${BASE}/trips/invites`, { headers: authHeader }),
        ])
        if (ownRes.ok) setRecentTrips(await ownRes.json())
        if (sharedRes.ok) setSharedTrips(await sharedRes.json())
        if (inviteRes.ok) setPendingInvites(await inviteRes.json())
      } catch (err) {
        console.error('[Dashboard] fetch error:', err)
      } finally {
        setTripsLoading(false)
      }
    }
    fetchAll()
  }, [])

  /* ── Accept invite ──────────────────────── */
  const handleAccept = async (tripId) => {
    setAccepting(tripId)
    try {
      const res = await fetch(`${BASE}/trips/${tripId}/accept`, { method: 'POST', headers: authHeader })
      if (res.ok) {
        const accepted = pendingInvites.find(i => i.tripId === tripId)
        setPendingInvites(prev => prev.filter(i => i.tripId !== tripId))
        if (accepted) setSharedTrips(prev => [...prev, {
          _id: accepted.tripId, destination: accepted.destination,
          departureDate: accepted.departureDate, returnDate: accepted.returnDate, budget: accepted.budget,
        }])
      }
    } catch (err) { console.error('Accept failed:', err) }
    finally { setAccepting(null) }
  }

  /* ── Decline invite ─────────────────────── */
  const handleDecline = async (tripId) => {
    setDeclining(tripId)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const myId = payload.id || payload._id || payload.sub
      const res = await fetch(`${BASE}/trips/${tripId}/collaborators/${myId}`, { method: 'DELETE', headers: authHeader })
      if (res.ok) setPendingInvites(prev => prev.filter(i => i.tripId !== tripId))
    } catch (err) { console.error('Decline failed:', err) }
    finally { setDeclining(null) }
  }

  const tripSetup = (() => { try { return JSON.parse(sessionStorage.getItem('tripSetupData') || '{}') } catch { return {} } })()
  const hasUpcoming = !!tripSetup.destination
  const firstName = user?.name?.split(' ')[0] || 'Traveler'

  /* ── Stats ──────────────────────────────── */
  const stats = [
    { icon: '🗺️', num: recentTrips.length, label: 'My Trips' },
    { icon: '🤝', num: sharedTrips.length, label: 'Shared' },
    { icon: '📬', num: pendingInvites.length, label: 'Invites' },
    { icon: '✈️', num: hasUpcoming ? 1 : 0, label: 'Upcoming' },
  ]

  /* ── Render helpers ────────────────────── */
  const TripImageCard = ({ trip, badge }) => (
    <motion.div
      className="ud-trip-card"
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(0,0,0,0.14)' }}
      onClick={() => navigate('/plans')}
    >
      <div className="ud-trip-img-wrap">
        <img src={getDestImg(trip.destination)} alt={trip.destination} className="ud-trip-img" />
        <div className="ud-trip-gradient" />
        <span className={`ud-trip-badge ${badge}`}>{badge === 'owner' ? 'Owner' : 'Collaborator'}</span>
      </div>
      <div className="ud-trip-body">
        <p className="ud-trip-location">📍 {trip.destination}</p>
        <p className="ud-trip-dates">
          {trip.departureDate?.slice(0, 10)} → {trip.returnDate?.slice(0, 10)}
        </p>
        {trip.budget && <p className="ud-trip-budget">₹{Number(trip.budget).toLocaleString()}</p>}
      </div>
    </motion.div>
  )

  return (
    <motion.div
      className="ud-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* ══════════════════════════════════════
          HERO STRIP
      ══════════════════════════════════════ */}
      <div className="ud-hero">
        <div className="ud-hero-orb ud-hero-orb--a" />
        <div className="ud-hero-orb ud-hero-orb--b" />

        <div className="ud-hero-inner">
          <motion.div
            className="ud-hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="ud-hero-eyebrow">✦ Your Journey Hub</p>
            <h1 className="ud-hero-greeting">Welcome back, {firstName} 👋</h1>
            <p className="ud-hero-sub">Pick up where you left off or start something new.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Link to="/setup" className="ud-hero-btn">
              + Plan a New Trip
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="ud-container">

        {/* ══════════════════════════════════════
            STATS ROW
        ══════════════════════════════════════ */}
        <motion.div
          className="ud-stats-row"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {stats.map((s) => (
            <motion.div key={s.label} className="ud-stat-card" variants={fadeUp}>
              <span className="ud-stat-icon">{s.icon}</span>
              <span className="ud-stat-num">{tripsLoading ? '—' : s.num}</span>
              <span className="ud-stat-label">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ══════════════════════════════════════
            UPCOMING TRIP BANNER (if exists)
        ══════════════════════════════════════ */}
        {hasUpcoming && (
          <motion.div
            className="ud-upcoming"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
          >
            <div className="ud-upcoming-img-wrap">
              <img src={getDestImg(tripSetup.destination)} alt={tripSetup.destination} className="ud-upcoming-img" />
              <div className="ud-upcoming-overlay" />
            </div>
            <div className="ud-upcoming-content">
              <span className="ud-upcoming-badge">● UPCOMING</span>
              <h2 className="ud-upcoming-dest">📍 {tripSetup.destination}</h2>
              <div className="ud-upcoming-meta">
                {tripSetup.departureDate && (
                  <span>📅 {tripSetup.departureDate} → {tripSetup.returnDate}</span>
                )}
                {tripSetup.budget && (
                  <span>💰 ₹{Number(tripSetup.budget).toLocaleString()}</span>
                )}
                {tripSetup.travelers && (
                  <span>👥 {tripSetup.travelers} traveler{tripSetup.travelers > 1 ? 's' : ''}</span>
                )}
              </div>
              <button className="ud-upcoming-btn" onClick={() => navigate('/plans')}>
                View Itinerary →
              </button>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════
            TABBED CONTENT
        ══════════════════════════════════════ */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>

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

          {/* Tab panels */}
          <AnimatePresence mode="wait">

            {/* ── My Trips ── */}
            {activeTab === 'My Trips' && (
              <motion.div
                key="my-trips"
                className="ud-tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
              >
                {tripsLoading ? (
                  <div className="ud-loading-grid">
                    {[1, 2, 3].map(n => <div key={n} className="ud-skeleton" />)}
                  </div>
                ) : recentTrips.length === 0 ? (
                  <div className="ud-empty-state">
                    <span className="ud-empty-icon">🗺️</span>
                    <p>No trips yet.</p>
                    <button className="ud-empty-cta" onClick={() => navigate('/setup')}>Plan your first trip →</button>
                  </div>
                ) : (
                  <motion.div className="ud-cards-grid" variants={stagger} initial="hidden" animate="show">
                    {recentTrips.map(trip => (
                      <TripImageCard key={trip._id} trip={trip} badge="owner" />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── Shared ── */}
            {activeTab === 'Shared' && (
              <motion.div
                key="shared"
                className="ud-tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
              >
                {tripsLoading ? (
                  <div className="ud-loading-grid">
                    {[1, 2].map(n => <div key={n} className="ud-skeleton" />)}
                  </div>
                ) : sharedTrips.length === 0 ? (
                  <div className="ud-empty-state">
                    <span className="ud-empty-icon">🤝</span>
                    <p>No shared trips yet.</p>
                    <p className="ud-empty-hint">Accept an invite to see trips shared with you.</p>
                  </div>
                ) : (
                  <motion.div className="ud-cards-grid" variants={stagger} initial="hidden" animate="show">
                    {sharedTrips.map(trip => (
                      <TripImageCard key={trip._id} trip={trip} badge="collaborator" />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── Invites ── */}
            {activeTab === 'Invites' && (
              <motion.div
                key="invites"
                className="ud-tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
              >
                {tripsLoading ? (
                  <div className="ud-empty-state"><span className="ud-empty-icon">⏳</span><p>Checking invites…</p></div>
                ) : pendingInvites.length === 0 ? (
                  <div className="ud-empty-state">
                    <span className="ud-empty-icon">📬</span>
                    <p>No pending invites.</p>
                    <p className="ud-empty-hint">When someone invites you to their trip, it'll appear here.</p>
                  </div>
                ) : (
                  <div className="ud-invites-list">
                    <AnimatePresence>
                      {pendingInvites.map(invite => (
                        <motion.div
                          key={String(invite.tripId)}
                          className="ud-invite-card"
                          initial={{ opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16, transition: { duration: 0.22 } }}
                          layout
                        >
                          {/* Cover thumbnail */}
                          <div className="ud-invite-thumb">
                            <img src={getDestImg(invite.destination)} alt={invite.destination} />
                          </div>

                          <div className="ud-invite-info">
                            <p className="ud-invite-dest">📍 {invite.destination}</p>
                            <p className="ud-invite-dates">
                              {invite.departureDate?.slice(0, 10)} → {invite.returnDate?.slice(0, 10)}
                            </p>
                          </div>

                          <div className="ud-invite-actions">
                            <button
                              className="ud-invite-btn accept"
                              onClick={() => handleAccept(String(invite.tripId))}
                              disabled={accepting === String(invite.tripId) || declining === String(invite.tripId)}
                            >
                              {accepting === String(invite.tripId) ? <span className="ud-spinner" /> : '✓ Accept'}
                            </button>
                            <button
                              className="ud-invite-btn decline"
                              onClick={() => handleDecline(String(invite.tripId))}
                              disabled={accepting === String(invite.tripId) || declining === String(invite.tripId)}
                            >
                              {declining === String(invite.tripId) ? <span className="ud-spinner" /> : 'Decline'}
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

      </div>
    </motion.div>
  )
}
