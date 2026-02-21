import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ActivityCard from '../components/ActivityCard'
import WhatIfDrawer from '../components/WhatIfDrawer'
import './PlanDetail.css'

const dayThemes = [
  { gradient: 'linear-gradient(135deg, #f09819 0%, #ff5858 100%)' }, // Tangerine to Red
  { gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }, // Amber to Peach
  { gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' }, // Deep Orange to Coral
  { gradient: 'linear-gradient(135deg, #ff9a44 0%, #fc6076 100%)' }, // Orange to Pinkish
  { gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }, // Soft Peach
]

export default function PlanDetail() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const originalPlan = mockPlans.find(p => p.id === planId) || mockPlans[0]

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Animated Aesthetic Background ── */}
      <div className="pd-animated-bg">
        <div className="pd-blob pd-blob-1" style={{ background: dayTheme.gradient }} />
        <div className="pd-blob pd-blob-2" style={{ background: dayTheme.gradient }} />
        <div className="pd-blob pd-blob-3" style={{ background: dayTheme.gradient }} />
      </div>

      <div className="pd-content-wrapper">
        {/* ── Immersive Hero ── */}
        <div className="pd-hero" style={{ backgroundImage: `url(${plan.photo})` }}>
          <div className="pd-hero-overlay" />
          <div className="pd-hero-content">
            <button className="pd-back-btn" onClick={() => navigate('/plans')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 2L4 8L10 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>All routes</span>
            </button>

            <div className="pd-hero-text">
              {plan.badge && <span className="pd-badge">{plan.badge}</span>}
              <h1 className="pd-title">{plan.name}</h1>
              <p className="pd-tagline">{plan.tagline}</p>
            </div>

            <div className="pd-hero-pills">
              <div className="pd-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                {plan.nights} nights
              </div>
              <div className="pd-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                {totalPeople} travelers
              </div>
              <div className="pd-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" /></svg>
                {plan.totalCost}
              </div>
              {refinedPlan && <div className="pd-pill pd-pill-ai">✦ AI Refined</div>}
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="pd-main">

          {/* LEFT: Itinerary Column */}
          <div className="pd-left">

            {/* Day Selector — Editorial Style */}
            <div className="editorial-day-nav">
              <span className="edn-label">Daily Itinerary</span>
              <div className="edn-tabs">
                {plan.days.map((day) => {
                  const isActive = selectedDay === day.day
                  return (
                    <motion.button
                      key={day.day}
                      className={`edn-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedDay(day.day)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {day.day < 10 ? `0${day.day}` : day.day}
                    </motion.button>
                  )
                })}
              </div>
              <div className="edn-line" />
            </div>

            {/* Day Header — High-End Typography */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`header-${selectedDay}`}
                className="editorial-day-header"
                initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="edh-meta">
                  <span className="edh-day-label">DAY {selectedDay}</span>
                  <span className="edh-dot" />
                  <span className="edh-stops">{currentDayData.activities.length} curated experiences</span>
                </div>
                <h2 className="edh-title">{currentDayData.title || 'Today\'s Journey'}</h2>
              </motion.div>
            </AnimatePresence>

            {/* Activities Timeline */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`activities-${selectedDay}`}
                className="pd-activities"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.32 }}
              >
                {currentDayData.activities.map((activity, idx) => (
                  <ActivityCard
                    key={idx}
                    activity={activity}
                    connector={idx < currentDayData.activities.length - 1}
                    index={idx}
                    themeGradient={dayTheme.gradient}
                  />
                ))}

                {/* AI Note */}
                <div className="pd-ai-note">
                  <div className="pd-ai-note-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 6v4m0 4h.01" />
                    </svg>
                  </div>
                  <p>{plan.aiNote}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Sticky Summary Panel */}
          <div className="pd-right">
            <div className="pd-summary-card">
              {/* Cost section */}
              <div className="pd-cost-section">
                <div className="pd-cost-label">TOTAL TRIP COST</div>
                <div className="pd-cost-amount">{plan.totalCost}</div>
                <div className="pd-cost-per">₹{(32000 / totalPeople).toLocaleString()} per person</div>
              </div>

              <div className="pd-divider" />

              {/* Highlights */}
              {plan.highlights && (
                <div className="pd-highlights">
                  <div className="pd-section-label">HIGHLIGHTS</div>
                  {plan.highlights.map((h, i) => (
                    <div key={i} className="pd-highlight-item">
                      <div className="pd-highlight-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pd-divider" />

              {/* Metrics */}
              <div className="pd-section-label">TRIP PULSE</div>
              <div className="pd-metrics">
                <MetricBar label="Budget" value={plan.metrics.budget} accent="#4facfe" delay={0} />
                <MetricBar label="Energy" value={plan.metrics.energy} accent="#43e97b" delay={0.1} />
                <MetricBar label="Experience" value={plan.metrics.experience} accent="#f093fb" delay={0.2} />
                <MetricBar label="Regret Risk" value={plan.metrics.regretRisk} isRisk delay={0.3} />
              </div>

              <div className="pd-divider" />

              {/* Crew */}
              <div className="pd-crew">
                <div className="pd-section-label">YOUR CREW</div>
                <div className="pd-avatars">
                  {['AR', 'PR', 'VK', 'ME'].map((initials, idx) => (
                    <div
                      key={idx}
                      className="pd-avatar"
                      style={{ background: `hsl(${idx * 80 + 200}, 65%, 55%)` }}
                      title={initials}
                    >
                      {initials}
                    </div>
                  ))}
                  <span className="pd-crew-count">+{totalPeople - 4 > 0 ? totalPeople - 4 : totalPeople} traveling</span>
                </div>
              </div>

              {/* CTAs */}
              <motion.button
                className="pd-btn-primary"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                Select this route
              </motion.button>

              <motion.button
                className="pd-btn-outline"
                onClick={() => setShowWhatIf(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Tweak this route
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── AI Refine Section ── */}
        <div className="itinerary-refine-wrapper">
          <motion.section
            className="itinerary-refine-section"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="refine-header">
              <span className="refine-sparkle">✦</span>
              <div>
                <h2 className="refine-title">Tweak this itinerary</h2>
                <p className="refine-subtitle">
                  Describe any changes in plain English — Gemini will update the plan for you instantly.
                </p>
              </div>
              {refinedPlan && (
                <motion.span
                  className="refine-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  AI Updated
                </motion.span>
              )}
            </div>

            <div className="refine-input-row">
              <div className="refine-textarea-wrap">
                <textarea
                  className="refine-textarea"
                  placeholder='e.g. "Replace the beach walk with a yoga session on Day 1" or "Add a cooking class on Day 2 evening"'
                  value={editPrompt}
                  onChange={e => setEditPrompt(e.target.value)}
                  rows={3}
                  disabled={isRefining}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRefine()
                  }}
                />
                <div className="refine-textarea-hint">⌘ + Enter to apply</div>
              </div>

              <div className="refine-actions">
                <motion.button
                  className={`refine-submit-btn ${isRefining ? 'loading' : ''}`}
                  onClick={handleRefine}
                  disabled={isRefining || !editPrompt.trim()}
                  whileHover={!isRefining && editPrompt.trim() ? { scale: 1.03 } : {}}
                  whileTap={!isRefining && editPrompt.trim() ? { scale: 0.97 } : {}}
                >
                  {isRefining ? (
                    <><span className="refine-spinner" />Applying…</>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      Apply Changes
                    </>
                  )}
                </motion.button>
              </div>
              </div>

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
