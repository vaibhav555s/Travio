import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ActivityCard from '../components/ActivityCard'
import WhatIfDrawer from '../components/WhatIfDrawer'
import MetricBar from '../components/MetricBar'
import './PlanDetail.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ACCENTS = {
  recommended:    '#E8631A',
  high_energy:    '#C44A6B',
  budget_friendly:'#4A9E6B',
}

const PHOTOS = {
  recommended:    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  high_energy:    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  budget_friendly:'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80',
}

const TITLES = {
  recommended:    'Recommended Route',
  high_energy:    'High Energy Adventure',
  budget_friendly:'Budget Friendly Plan',
}

const dayThemes = [
  { gradient: 'linear-gradient(135deg, #f09819 0%, #ff5858 100%)' },
  { gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
  { gradient: 'linear-gradient(135deg, #ff9a44 0%, #fc6076 100%)' },
  { gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
]

export default function PlanDetail() {
  const { planId } = useParams()
  const navigate = useNavigate()

  // 1. Get the high-level selected option
  const savedOptions = sessionStorage.getItem('generatedOptions')
  const options = savedOptions ? JSON.parse(savedOptions) : []
  const originalPlan = options.find(p => p.id === planId) || options[0]
  const navigate   = useNavigate()

  const [itinerary, setItinerary]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [selectedDay, setSelectedDay] = useState(1)
  const [showWhatIf, setShowWhatIf] = useState(false)

  // 2. Fetch full day-by-day plan on mount
  useEffect(() => {
    async function fetchFullPlan() {
      if (!originalPlan) {
        setError("Plan not found. Please regenerate.")
        setLoading(false)
        return
      }

      try {
        const savedTrip = sessionStorage.getItem('tripSetupData')
        let tripData = {}
        if (savedTrip && savedTrip !== 'undefined') {
          tripData = JSON.parse(savedTrip)
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const res = await fetch(`${apiUrl}/api/generate-itinerary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedOptionId: originalPlan.id,
            originalTripData: tripData,
          }),
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to generate itinerary')
        }

        const data = await res.json()

        // 3. Map the AI backend response to the frontend structure
        const fullPlan = {
          ...originalPlan,
          tagline: data.tripSummary || originalPlan.shortDescription,
          totalCost: data.estimatedTotalBudget || originalPlan.price || 'Rs. 25,000',
          days: data.dailyPlan || data.itinerary || data.days || data.daily_plan || [],
          travelTips: data.travelTips || [],
          photo: originalPlan.photo || 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2952&auto=format&fit=crop', // fallback
          // Mock metrics since AI doesn't return them yet
          metrics: { budget: 65, energy: 80, experience: 90, regretRisk: 10 }
        }

        setItinerary(fullPlan)
      } catch (err) {
        console.error("Itinerary fetch error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFullPlan()
  }, [originalPlan?.id])

  // Refinement state
  const [editPrompt, setEditPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [refinedPlan, setRefinedPlan] = useState(false)

  const handleRefine = async () => {
    if (!editPrompt.trim()) return
    setIsRefining(true)
    setRefineError('')

    // We must send the full detailed plan (with days), not just the shallow originalPlan
    const planToRefine = refinedPlan || itinerary || originalPlan

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${apiUrl}/api/itinerary/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planToRefine, userRequest: editPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setRefinedPlan(data.refinedPlan)
      setSelectedDay(data.refinedPlan.days?.[0]?.day || 1)
  const accent   = ACCENTS[planId] || '#E8631A'
  const photo    = PHOTOS[planId]  || PHOTOS.recommended
  const title    = TITLES[planId]  || 'Your Itinerary'
  const dayTheme = dayThemes[(selectedDay - 1) % dayThemes.length]

  const tripData   = (() => {
    try { return JSON.parse(sessionStorage.getItem('tripSetupData') || '{}') } catch { return {} }
  })()
  const totalPeople = tripData.travelers || 1

  // ── Fetch Itinerary ──
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const originalTripData = tripData

        const savedOptions  = sessionStorage.getItem('generatedOptions')
        const options       = savedOptions ? JSON.parse(savedOptions) : []
        const matchedOption = options.find(o => o.id === planId)
        const token         = localStorage.getItem('accessToken')

        console.log('Sending to generate-itinerary:', {
          tripId: originalTripData.tripId,
          planId: matchedOption?.planId,
          matchedOption,
        })

        const response = await fetch(`${API_URL}/api/itinerary/generate-itinerary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({
            selectedOptionId: planId,
            originalTripData,
            tripId: originalTripData.tripId || matchedOption?.tripId,
            planId: matchedOption?.planId,
          }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Server error')
        }

        const data = await response.json()
        setItinerary(data)

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

  // ── Select Route ──
  const handleSelectRoute = async () => {
    try {
      const savedOptions  = sessionStorage.getItem('generatedOptions')
      const options       = savedOptions ? JSON.parse(savedOptions) : []
      const matchedOption = options.find(o => o.id === planId)
      const token         = localStorage.getItem('accessToken')

      if (matchedOption?.planId && token) {
        await fetch(`${API_URL}/api/plans/${matchedOption.planId}/select`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to select plan:', err)
      navigate('/dashboard')
    }
  }

  // ── AI Refine ──
  const handleRefine = async () => {
    if (!editPrompt.trim()) return
    setIsRefining(true)
    try {
      // placeholder for refine API call
      await new Promise(r => setTimeout(r, 1500))
      setRefinedPlan(true)
      setEditPrompt('')
    } catch (err) {
      console.error('Refine error:', err)
    } finally {
      setIsRefining(false)
    }
  }

  // ── Loading ──
  if (loading) return (
    <div className="plan-detail" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'1rem' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ width:48, height:48, border:`3px solid ${accent}`, borderTopColor:'transparent', borderRadius:'50%' }}
      />
      <p style={{ color:'var(--color-text-secondary)', fontSize:'1rem' }}>Generating your day-by-day itinerary…</p>
    </div>
  )

  // ── Error ──
  if (error) return (
    <div className="plan-detail" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'1rem', textAlign:'center', padding:'2rem' }}>
      <p style={{ fontSize:'3rem' }}>⚠️</p>
      <h2>Could not load itinerary</h2>
      <p style={{ color:'var(--color-text-secondary)' }}>{error}</p>
      <button onClick={() => navigate('/plans')} style={{ background:accent, color:'white', border:'none', borderRadius:'100px', padding:'12px 24px', fontSize:'1rem', cursor:'pointer', marginTop:'1rem' }}>
        ← Back to routes
      </button>
    </div>
  )

  const currentDayData = itinerary.dailyPlan?.find(d => d.day === selectedDay) || itinerary.dailyPlan?.[0]

  // Render Loader
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', flexDirection: 'column', gap: '20px' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#4B5563', fontSize: '1.2rem', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Crafting your day-by-day itinerary...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Render Error
  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#DC2626', marginBottom: '10px' }}>Oops! Something went wrong</h2>
          <p style={{ color: '#7F1D1D', marginBottom: '20px' }}>{error}</p>
          <button onClick={() => navigate('/plans')} style={{ background: '#DC2626', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Go Back</button>
        </div>
      </div>
    )
  }

  const plan = refinedPlan || itinerary || originalPlan

  // Safe default for currentDayData since AI might format things differently
  const currentDayData = plan?.days?.find(d => d.day == selectedDay) || plan?.days?.[0] || { activities: [] }
  const totalPeople = 4
  const dayTheme = dayThemes[(selectedDay - 1) % dayThemes.length]

  return (
    <motion.div
      className="plan-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated Background */}
      <div className="pd-animated-bg">
        <div className="pd-blob pd-blob-1" style={{ background: dayTheme.gradient }} />
        <div className="pd-blob pd-blob-2" style={{ background: dayTheme.gradient }} />
        <div className="pd-blob pd-blob-3" style={{ background: dayTheme.gradient }} />
      </div>

      <div className="pd-content-wrapper">

        {/* Hero */}
        <div className="pd-hero" style={{ backgroundImage: `url(${photo})` }}>
          <div className="pd-hero-overlay" />
          <div className="pd-hero-content">
            <button className="pd-back-btn" onClick={() => navigate('/plans')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 2L4 8L10 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>All routes</span>
            </button>
            <div className="pd-hero-text">
              {refinedPlan && <span className="pd-badge">AI Refined</span>}
              <h1 className="pd-title">{title}</h1>
              <p className="pd-tagline">{itinerary.tripSummary?.slice(0, 100)}...</p>
            </div>
            <div className="pd-hero-pills">
              <div className="pd-pill">{itinerary.dailyPlan?.length || 0} nights</div>
              <div className="pd-pill">{totalPeople} travelers</div>
              <div className="pd-pill">{itinerary.estimatedTotalBudget}</div>
              {refinedPlan && <div className="pd-pill pd-pill-ai">✦ AI Refined</div>}
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="pd-main">

          {/* LEFT: Itinerary */}
          <div className="pd-left">
            <div className="editorial-day-nav">
              <span className="edn-label">Daily Itinerary</span>
              <div className="edn-tabs">
                {plan?.days?.map((day, idx) => {
                  const dayNum = day.day || (idx + 1) // fallback if AI forgets the day property
                  const isActive = selectedDay == dayNum
                  return (
                    <motion.button
                      key={idx}
                      className={`edn-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedDay(dayNum)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {dayNum < 10 ? `0${dayNum}` : dayNum}
                    </motion.button>
                  )
                })}
                {itinerary.dailyPlan?.map((day) => (
                  <motion.button
                    key={day.day}
                    className={`edn-tab ${selectedDay === day.day ? 'active' : ''}`}
                    onClick={() => setSelectedDay(day.day)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {day.day < 10 ? `0${day.day}` : day.day}
                  </motion.button>
                ))}
              </div>
              <div className="edn-line" />
            </div>

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
                  <span className="edh-stops">{currentDayData?.activities?.length || 0} curated experiences</span>
                </div>
                <h2 className="edh-title">{currentDayData?.title || "Today's Journey"}</h2>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`activities-${selectedDay}`}
                className="pd-activities"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.32 }}
              >
                {currentDayData?.activities?.map((activity, idx) => {
                  const energyLevels = ['Low', 'Medium', 'High']
                  return (
                    <ActivityCard
                      key={idx}
                      activity={{
                        time: activity.time,
                        name: activity.activity || activity.title || activity.name,
                        description: activity.location || activity.description,
                        cost: activity.costEstimate || activity.cost || 'Free',
                        energy: activity.energy || energyLevels[idx % 3], // fallback if AI skips energy
                        type: 'activity'
                      }}
                      connector={idx < currentDayData.activities.length - 1}
                      index={idx}
                      themeGradient={dayTheme.gradient}
                    />
                  )
                })}

                {/* AI Note */}
                {plan.aiNote && (
                  <div className="pd-ai-note">
                    <div className="pd-ai-note-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 6v4m0 4h.01" />
                      </svg>
                    </div>
                    <p>{plan.aiNote}</p>
                  </div>
                )}
                {currentDayData?.activities?.map((activity, idx) => (
                  <ActivityCard
                    key={idx}
                    activity={{
                      time:     activity.time,
                      name:     activity.activity,
                      type:     'activity',
                      energy:   'Medium',
                      cost:     activity.costEstimate,
                      location: activity.location,
                    }}
                    connector={idx < currentDayData.activities.length - 1}
                    index={idx}
                    themeGradient={dayTheme.gradient}
                  />
                ))}

                <div className="pd-ai-note">
                  <div className="pd-ai-note-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 6v4m0 4h.01" />
                    </svg>
                  </div>
                  <p>{itinerary.tripSummary}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Sticky Panel */}
          <div className="pd-right">
            <div className="pd-summary-card">
              <div className="pd-cost-section">
                <div className="pd-cost-label">TOTAL TRIP COST</div>
                <div className="pd-cost-amount">{itinerary.estimatedTotalBudget}</div>
                <div className="pd-cost-per">for {totalPeople} traveler{totalPeople > 1 ? 's' : ''}</div>
              </div>

              <div className="pd-divider" />

              {/* Travel Tips */}
              {itinerary.travelTips?.length > 0 && (
                <div className="pd-highlights">
                  <div className="pd-section-label">TRAVEL TIPS</div>
                  {itinerary.travelTips.map((tip, i) => (
                    <div key={i} className="pd-highlight-item">
                      <div className="pd-highlight-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pd-divider" />

              {/* Metrics */}
              <div className="pd-section-label">TRIP PULSE</div>
              <div className="pd-metrics">
                <MetricBar label="Budget" value={plan.metrics?.budget || 65} accent="#4facfe" delay={0} />
                <MetricBar label="Energy" value={plan.metrics?.energy || 80} accent="#43e97b" delay={0.1} />
                <MetricBar label="Experience" value={plan.metrics?.experience || 90} accent="#f093fb" delay={0.2} />
                <MetricBar label="Regret Risk" value={plan.metrics?.regretRisk || 10} isRisk delay={0.3} />
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
                onClick={handleSelectRoute}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Select this route →
              </motion.button>

              <motion.button
                className="pd-btn-outline"
                onClick={() => setShowWhatIf(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Tweak this route
              </motion.button>
            </div>
          </div>
        </div>

        {/* AI Refine Section */}
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
                <p className="refine-subtitle">Describe any changes in plain English — Gemini will update the plan instantly.</p>
              </div>
              {refinedPlan && (
                <motion.span className="refine-badge" initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}>
                  AI Updated
                </motion.span>
              )}
            </div>

            <div className="refine-input-row">
              <div className="refine-textarea-wrap">
                <textarea
                  className="refine-textarea"
                  placeholder='e.g. "Replace the beach walk with a yoga session on Day 1"'
                  value={editPrompt}
                  onChange={e => setEditPrompt(e.target.value)}
                  rows={3}
                  disabled={isRefining}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRefine() }}
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
            {itinerary?.travelTips && itinerary.travelTips.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Travel Tips
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {itinerary.travelTips.map((tip, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: '#F59E0B', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <AnimatePresence>
              {refineError && (
                <motion.div
                  className="refine-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {refineError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="refine-suggestion-chips">
              {[
                'Make it more budget-friendly',
                'Add a sunset activity',
                'Replace nightlife with local dining',
                'Add a morning yoga session',
              ].map(chip => (
                <button
                  key={chip}
                  className="refine-chip"
                  onClick={() => setEditPrompt(chip)}
                  disabled={isRefining}
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

      <WhatIfDrawer isOpen={showWhatIf} onClose={() => setShowWhatIf(false)} />
    </motion.div>

  )
}