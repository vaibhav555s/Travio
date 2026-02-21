import { useState,useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ActivityCard from '../components/ActivityCard'
import CrewChat from '../components/CrewChat'
import Toast from '../components/Toast'
import { mockPlans } from '../data/mockPlans'
import './Dashboard.css'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export default function Dashboard() {
  const [showCrewChat, setShowCrewChat] = useState(false)
  const [toast, setToast] = useState(null)
  const [currentDay] = useState(2)
  const [weather, setWeather] = useState(false)
  const [plan, setPlan]         = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const saved  = sessionStorage.getItem('tripSetupData')
        const tripData = saved ? JSON.parse(saved) : {}
        const token  = localStorage.getItem('accessToken')

        if (tripData.tripId && token) {
          const res = await fetch(
            `${API_URL}/api/plans/trip/${tripData.tripId}/selected`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (res.ok) {
            const data = await res.json()
            setPlan(data)
          }
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])
  if (loading) return <div className="dashboard">Loading...</div>
  const activePlan = plan || mockPlans[0]
  const currentDayData = activePlan.days?.find(d => d.day === currentDay) 
    || activePlan.dailyPlan?.find(d => d.day === currentDay)
    || activePlan.days?.[0]
    || activePlan.dailyPlan?.[0]
  const handleSimulateRain = () => {
    setWeather(true)
    setToast({
      message: 'Weather alert: Heavy rain at 15:00. Route adjusted.',
      icon: '⚡',
    })
  }

  return (
    
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header Bar */}
      <header className="dashboard-header">
        <div className="header-grain" />
        <div className="header-left">
          <h1 className="header-logo">Radiator Routes</h1>
        </div>
        <div className="header-center">
          <span className="live-indicator">●</span>
          <span className="header-status">LIVE · Day {currentDay} of {plan.nights}</span>
        </div>
        <div className="header-right">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="6" fill="none" stroke="#E8A21A" strokeWidth="1" />
            <line x1="9" y1="2" x2="9" y2="0" stroke="#E8A21A" strokeWidth="1" />
            <line x1="16" y1="9" x2="18" y2="9" stroke="#E8A21A" strokeWidth="1" />
            <line x1="2" y1="9" x2="0" y2="9" stroke="#E8A21A" strokeWidth="1" />
            <line x1="9" y1="16" x2="9" y2="18" stroke="#E8A21A" strokeWidth="1" />
            <line x1="4" y1="4" x2="2.5" y2="2.5" stroke="#E8A21A" strokeWidth="1" />
            <line x1="14" y1="14" x2="15.5" y2="15.5" stroke="#E8A21A" strokeWidth="1" />
            <line x1="14" y1="4" x2="15.5" y2="2.5" stroke="#E8A21A" strokeWidth="1" />
            <line x1="4" y1="14" x2="2.5" y2="15.5" stroke="#E8A21A" strokeWidth="1" />
          </svg>
          <span className="header-weather">32°C · Sunny</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Left: Timeline */}
        <div className="dashboard-left">
          <div className="timeline-header">
            <h2 className="timeline-title">DAY {currentDay} — CULTURE & COAST</h2>
            <p className="timeline-date">Thursday, March 13, 2025</p>
          </div>

          <div className="activities-timeline">
            <AnimatePresence>
              {currentDayData.activities.map((activity, idx) => {
                const isPast = idx < 1
                const isCurrent = idx === 1
                return (
                  <div key={idx}>
                    <ActivityCard
                      activity={activity}
                      isPast={isPast}
                      isCurrent={isCurrent}
                      connector={idx < currentDayData.activities.length - 1}
                    />
                  </div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Control Panel */}
        <div className="dashboard-right">
          <div className="control-panel">
            <h3 className="control-title">Trip Controls</h3>

            {/* Simulate Rain */}
            <div className="control-row">
              <div className="control-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 11C3 8.2 5.2 6 8 6C8.3 3.6 10.4 2 13 2C15.8 2 18 4.2 18 7C18 7.1 18 7.2 18 7.3M4 15H16M6 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="control-label">Simulate Rain</p>
                  <p className="control-caption">Reroute around weather</p>
                </div>
              </div>
              <button className="control-button" onClick={handleSimulateRain}>
                Simulate
              </button>
            </div>

            {/* Flight Delay */}
            <div className="control-row">
              <div className="control-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="4" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="10" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <polyline points="16 8 18 10 16 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="control-label">Flight Delay</p>
                  <p className="control-caption">Compress day 1 schedule</p>
                </div>
              </div>
              <button className="control-button">Simulate</button>
            </div>

            {/* Swap Activity */}
            <div className="control-row">
              <div className="control-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 7C3 5.9 3.9 5 5 5H10M17 13C17 14.1 16.1 15 15 15H10M4 7L7 4M16 13L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="control-label">Swap Activity</p>
                  <p className="control-caption">Replace any planned stop</p>
                </div>
              </div>
              <button className="control-button">Open</button>
            </div>

            {/* Crew Chat */}
            <div className="control-row">
              <div className="control-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 9C3 6.24 5.24 4 8 4H16C17.1 4 18 4.9 18 6V12C18 13.1 17.1 14 16 14H8.5L5 17V14H4C3.45 14 3 13.55 3 13V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="control-label">Crew Chat</p>
                  <p className="control-caption">4 travelers · 2 unread</p>
                </div>
              </div>
              <button className="control-button" onClick={() => setShowCrewChat(true)}>
                Open
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CrewChat Drawer */}
      <CrewChat isOpen={showCrewChat} onClose={() => setShowCrewChat(false)} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            icon={toast.icon}
            onDismiss={() => setToast(null)}
            autoClose
          />
        )}
      </AnimatePresence>

      {/* Floating Adjust Button */}
      <motion.button
        className="floating-adjust-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ⟳ Adjust route
      </motion.button>
    </motion.div>
  )
}
