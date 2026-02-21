import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TripCard from '../components/TripCard'
import TeamCard from '../components/TeamCard'
import {useState,useEffect} from "react"
import './UserDashboard.css'

const mockRecentTrips = [
    { id: '1', destination: 'Goa', dates: 'Mar 1 – Mar 6', budget: '32,000', badge: 'owner' },
    { id: '2', destination: 'Manali', dates: 'Apr 12 – Apr 18', budget: '28,000', badge: 'team', teamName: 'Weekend Warriors' },
    { id: '3', destination: 'Rishikesh', dates: 'May 3 – May 7', budget: '18,000', badge: 'owner' },
]
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

export default function UserDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [recentTrips, setRecentTrips] = useState([])
const [tripsLoading, setTripsLoading] = useState(true)

useEffect(() => {
  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setRecentTrips(data)
      }
    } catch (err) {
      console.error('Failed to fetch trips:', err)
    } finally {
      setTripsLoading(false)
    }
  }
  fetchTrips()
}, [])

    const tripSetup = (() => {
        try { return JSON.parse(sessionStorage.getItem('tripSetupData') || '{}') } catch { return {} }
    })()
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
                            <button
                                style={{ background: 'none', border: 'none', color: '#E8631A', cursor: 'pointer', fontWeight: 700 }}
                                onClick={() => navigate('/setup')}
                            >
                                Plan one now →
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* ── Recent Trips (staggered) ── */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.18 }}>
  <p className="ud-section-title">Recent Trips</p>
  {tripsLoading ? (
    <p style={{ color: 'var(--color-text-secondary)' }}>Loading trips...</p>
  ) : recentTrips.length === 0 ? (
    <div className="ud-empty">
      No trips yet.{' '}
      <button
        style={{ background: 'none', border: 'none', color: '#E8631A', cursor: 'pointer', fontWeight: 700 }}
        onClick={() => navigate('/setup')}
      >
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

                {/* ── Teams Snapshot (staggered) ── */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.26 }}>
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
