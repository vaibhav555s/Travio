import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ActivityCard from '../components/ActivityCard'
import WhatIfDrawer from '../components/WhatIfDrawer'
import './PlanDetail.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/** Accent color per option id */
const ACCENTS = {
  recommended: '#E8631A',
  high_energy: '#C44A6B',
  budget_friendly: '#4A9E6B',
}

/** Hero photo per option id */
const PHOTOS = {
  recommended: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  high_energy: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  budget_friendly: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80',
}

const TITLES = {
  recommended: 'Recommended Route',
  high_energy: 'High Energy Adventure',
  budget_friendly: 'Budget Friendly Plan',
}

export default function PlanDetail() {
  const { planId } = useParams()
  const navigate = useNavigate()

  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState(1)
  const [showWhatIf, setShowWhatIf] = useState(false)

  const accent = ACCENTS[planId] || '#E8631A'
  const photo = PHOTOS[planId] || PHOTOS.recommended
  const title = TITLES[planId] || 'Your Itinerary'
  const handleSelectRoute = async () => {
    try {
      const savedOptions = sessionStorage.getItem('generatedOptions')
      const options = savedOptions ? JSON.parse(savedOptions) : []
      const matchedOption = options.find(o => o.id === planId)
      const token = localStorage.getItem('accessToken')
  
      if (matchedOption?.planId && token) {
        await fetch(`${API_URL}/api/plans/${matchedOption.planId}/select`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
  
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to select plan:', err)
      navigate('/dashboard') // still navigate on failure
    }
  }
  

  useEffect(() => {
    // PlanDetail.jsx - update fetchItinerary
const fetchItinerary = async () => {
  try {
    const saved = sessionStorage.getItem('tripSetupData')
    const originalTripData = saved ? JSON.parse(saved) : {}

    // Get planId from generatedOptions
    const savedOptions = sessionStorage.getItem('generatedOptions')
    const options = savedOptions ? JSON.parse(savedOptions) : []
    const matchedOption = options.find(o => o.id === planId)
    const token = localStorage.getItem('accessToken')

    const response = await fetch(`${API_URL}/api/itinerary/generate-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        selectedOptionId: planId,
        originalTripData,
        tripId:  originalTripData.tripId,
        planId:  matchedOption?.planId,       // ← from backend response
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Server error')
    }

    const data = await response.json()
    setItinerary(data)

    // Store itineraryId for dashboard use
    if (data.itineraryId) {
      sessionStorage.setItem('itineraryId', data.itineraryId)
    }

    setSelectedDay(data.dailyPlan?.[0]?.day || 1)
  } catch (err) {
    console.error('[PlanDetail] Error:', err)
    setError(err.message || 'Failed to load itinerary.')
  } finally {
    setLoading(false)
  }
}

    fetchItinerary()
  }, [planId])

  const tripData = (() => {
    try { return JSON.parse(sessionStorage.getItem('tripSetupData') || '{}') } catch { return {} }
  })()
  const totalPeople = tripData.travelers || 1

  // ── Loading State ──
  if (loading) {
    return (
      <div className="plan-detail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 48, height: 48, border: `3px solid ${accent}`, borderTopColor: 'transparent', borderRadius: '50%' }}
        />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Generating your day-by-day itinerary…</p>
      </div>
    )
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="plan-detail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '3rem' }}>⚠️</p>
        <h2>Could not load itinerary</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
        <button
          onClick={() => navigate('/plans')}
          style={{ background: accent, color: 'white', border: 'none', borderRadius: '100px', padding: '12px 24px', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' }}
        >
          ← Back to routes
        </button>
      </div>
    )
  }

  const currentDayData = itinerary.dailyPlan?.find(d => d.day === selectedDay) || itinerary.dailyPlan?.[0]

  return (
    <motion.div
      className="plan-detail"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
    >
      {/* Hero Header */}
      <div className="plan-detail-hero" style={{ backgroundImage: `url(${photo})` }}>
        <div className="plan-detail-overlay" />
        <div className="plan-detail-header-content">
          <button className="back-button" onClick={() => navigate('/plans')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L4 8L10 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Back to routes</span>
          </button>
          <h1 className="plan-detail-title">{title}</h1>
          <div className="plan-meta-pills">
            <div className="meta-pill">{itinerary.dailyPlan?.length || 0} Days</div>
            <div className="meta-pill">{totalPeople} Traveler{totalPeople > 1 ? 's' : ''}</div>
            <div className="meta-pill">{itinerary.estimatedTotalBudget} total</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="plan-detail-main">
        {/* Left Column: Itinerary */}
        <div className="plan-detail-left">
          <div className="day-selector">
            {itinerary.dailyPlan?.map(day => (
              <motion.button
                key={day.day}
                className={`day-button ${selectedDay === day.day ? 'active' : ''}`}
                onClick={() => setSelectedDay(day.day)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Day {day.day}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="activities-list"
            >
              {currentDayData && (
                <>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                    Day {currentDayData.day}: {currentDayData.title}
                  </h3>
                  {currentDayData.activities?.map((activity, idx) => (
                    <div key={idx}>
                      <ActivityCard
                        activity={{
                          time: activity.time,
                          name: activity.activity,
                          type: 'activity',
                          energy: 'Medium',
                          cost: activity.costEstimate,
                          location: activity.location,
                        }}
                        connector={idx < currentDayData.activities.length - 1}
                      />
                    </div>
                  ))}
                </>
              )}

              <div className="ai-day-note">
                <p>{itinerary.tripSummary}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Sticky Panel */}
        <div className="plan-detail-right">
          <div className="summary-card">
            <div className="total-cost">{itinerary.estimatedTotalBudget}</div>
            <p className="per-person">
              for {totalPeople} traveler{totalPeople > 1 ? 's' : ''}
            </p>

            <div className="summary-divider" />

            {/* Travel Tips */}
            {itinerary.travelTips && itinerary.travelTips.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Travel Tips
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {itinerary.travelTips.map((tip, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: accent, fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="summary-divider" />

            <motion.button
            className="button button-primary"
            onClick={handleSelectRoute}   // ← updated
            style={{ backgroundColor: accent }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Select this route →
          </motion.button>

            <motion.button
              className="button button-outline"
              onClick={() => setShowWhatIf(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Tweak this route
            </motion.button>
          </div>
        </div>
      </div>

      <WhatIfDrawer isOpen={showWhatIf} onClose={() => setShowWhatIf(false)} />
    </motion.div>
  )
}
