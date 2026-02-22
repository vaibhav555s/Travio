import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ActivityCard from '../components/ActivityCard'
import WhatIfDrawer from '../components/WhatIfDrawer'
import MetricBar from '../components/MetricBar'
import CollaboratorModal from '../components/CollaboratorModal'
import './PlanDetail.css'

const API_BASE = '/api'

const ACCENTS = {
  recommended: '#E8631A',
  high_energy: '#C44A6B',
  budget_friendly: '#4A9E6B',
}

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

  // ── State ──
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState(1)
  const [showWhatIf, setShowWhatIf] = useState(false)
  const [editPrompt, setEditPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [refinedPlan, setRefinedPlan] = useState(null)
  const [refineError, setRefineError] = useState('')
  const [showCollabModal, setShowCollabModal] = useState(false)

  // ── Derived Data ──
  const savedOptions = sessionStorage.getItem('generatedOptions')
  const options = savedOptions ? JSON.parse(savedOptions) : []
  const originalPlan = options.find(p => p.id === planId) || options[0]

  const accent = ACCENTS[planId] || '#E8631A'
  const basePhoto = PHOTOS[planId] || PHOTOS.recommended
  const title = TITLES[planId] || 'Your Itinerary'

  const tripData = (() => {
    try { return JSON.parse(sessionStorage.getItem('tripSetupData') || '{}') } catch { return {} }
  })()
  const totalPeople = tripData.travelers || 1
  const tripId = tripData.tripId || originalPlan?.tripId || null
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.id || payload._id || payload.sub || null
    } catch { return null }
  })()

  // ── Fetch Initial Itinerary ──
  useEffect(() => {
    async function fetchFullPlan() {
      if (!originalPlan) {
        setError("Plan not found. Please regenerate.")
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`${API_BASE}/itinerary/generate-itinerary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({
            selectedOptionId: originalPlan.id,
            originalTripData: tripData,
            tripId: tripData.tripId || originalPlan.tripId,
            planId: originalPlan.planId,
          }),
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to generate itinerary')
        }

        const data = await res.json()

        if (data.itineraryId) {
          sessionStorage.setItem('itineraryId', data.itineraryId)
        }

        // Map backend response to our expected structure
        const fullPlan = {
          ...originalPlan,
          tagline: data.tripSummary || originalPlan.shortDescription,
          totalCost: data.estimatedTotalBudget || originalPlan.price || 'Rs. 25,000',
          days: data.dailyPlan || data.itinerary || data.days || data.daily_plan || [],
          travelTips: data.travelTips || [],
          photo: originalPlan.photo || basePhoto,
          metrics: { budget: 65, energy: 80, experience: 90, regretRisk: 10 }
        }

        setItinerary(fullPlan)
        setSelectedDay(fullPlan.days?.[0]?.day || 1)
      } catch (err) {
        console.error("Itinerary fetch error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFullPlan()
  }, [planId])

  // ── Handlers ──
  const handleSelectRoute = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      // Mark this plan as selected in DB
      if (originalPlan?.planId && token) {
        await fetch(`${API_BASE}/plans/${originalPlan.planId}/select`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      // Store the full itinerary in sessionStorage so Dashboard can read real data
      const activeItinerary = refinedPlan || itinerary || originalPlan
      sessionStorage.setItem('selectedItinerary', JSON.stringify(activeItinerary))
      sessionStorage.setItem('selectedPlanMeta', JSON.stringify({
        planId: originalPlan?.planId || null,
        tripId: tripData.tripId || null,
        title: title,
        accent: ACCENTS[planId] || '#E8631A',
        photo: basePhoto,
        destination: tripData.destination || '',
        departureDate: tripData.departureDate || '',
        returnDate: tripData.returnDate || '',
        budget: tripData.budget || 0,
        travelers: totalPeople,
        totalCost: activeItinerary?.estimatedTotalBudget || activeItinerary?.totalCost || '',
      }))

      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to select plan:', err)
      navigate('/dashboard')
    }
  }

  const handleRefine = async () => {
    if (!editPrompt.trim()) return
    setIsRefining(true)
    setRefineError('')

    const planToRefine = refinedPlan || itinerary || originalPlan

    try {
      const res = await fetch(`${API_BASE}/itinerary/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planToRefine, userRequest: editPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')

      setRefinedPlan(data.refinedPlan)
      setSelectedDay(data.refinedPlan.days?.[0]?.day || 1)
      setEditPrompt('')
    } catch (err) {
      setRefineError(err.message)
    } finally {
      setIsRefining(false)
    }
  }

  // ── Render Helpers ──
  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', flexDirection: 'column', gap: '20px' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#4B5563', fontSize: '1.2rem', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Crafting your day-by-day itinerary...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#DC2626', marginBottom: '10px' }}>Oops! Something went wrong</h2>
          <p style={{ color: '#7F1D1D', marginBottom: '20px' }}>{error}</p>
          <button onClick={() => navigate('/plans')} style={{ background: '#DC2626', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Go Back</button>
        </div>
      </div>
    )
  }

  const plan = refinedPlan || itinerary || originalPlan
  const currentDayData = plan?.days?.find(d => d.day == selectedDay) || plan?.days?.[0] || { activities: [] }
  const dayTheme = dayThemes[(selectedDay - 1) % dayThemes.length]

  return (
    <motion.div
      className="plan-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="pd-animated-bg">
        <div className="pd-blob pd-blob-1" style={{ background: dayTheme.gradient }} />
        <div className="pd-blob pd-blob-2" style={{ background: dayTheme.gradient }} />
        <div className="pd-blob pd-blob-3" style={{ background: dayTheme.gradient }} />
      </div>

      <div className="pd-content-wrapper">
        <div className="pd-hero" style={{ backgroundImage: `url(${plan.photo || basePhoto})` }}>
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
              <p className="pd-tagline">{plan.tagline?.slice(0, 100)}...</p>
            </div>
            <div className="pd-hero-pills">
              <div className="pd-pill">{plan.days?.length || 0} nights</div>
              <div className="pd-pill">{totalPeople} travelers</div>
              <div className="pd-pill">{plan.totalCost}</div>
              {refinedPlan && <div className="pd-pill pd-pill-ai">✦ AI Refined</div>}
            </div>
          </div>
        </div>

        <div className="pd-main">
          <div className="pd-left">
            <div className="editorial-day-nav">
              <span className="edn-label">Daily Itinerary</span>
              <div className="edn-tabs">
                {plan?.days?.map((day, idx) => {
                  const dayNum = day.day || (idx + 1)
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
                {currentDayData?.activities?.map((activity, idx) => (
                  <ActivityCard
                    key={idx}
                    activity={{
                      time: activity.time,
                      name: activity.activity || activity.title || activity.name,
                      description: activity.location || activity.description,
                      cost: activity.costEstimate || activity.cost || 'Free',
                      energy: activity.energy || 'Medium',
                      type: 'activity'
                    }}
                    connector={idx < currentDayData.activities.length - 1}
                    index={idx}
                    themeGradient={dayTheme.gradient}
                  />
                ))}

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
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pd-right">
            <div className="pd-summary-card">
              <div className="pd-cost-section">
                <div className="pd-cost-label">TOTAL TRIP COST</div>
                <div className="pd-cost-amount">{plan.totalCost}</div>
                <div className="pd-cost-per">for {totalPeople} traveler{totalPeople > 1 ? 's' : ''}</div>
              </div>

              <div className="pd-divider" />

              {plan.travelTips?.length > 0 && (
                <div className="pd-highlights">
                  <div className="pd-section-label">TRAVEL TIPS</div>
                  {plan.travelTips.map((tip, i) => (
                    <div key={i} className="pd-highlight-item">
                      <div className="pd-highlight-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pd-divider" />

              <div className="pd-section-label">TRIP PULSE</div>
              <div className="pd-metrics">
                <MetricBar label="Budget" value={plan.metrics?.budget || 65} accent="#4facfe" delay={0} />
                <MetricBar label="Energy" value={plan.metrics?.energy || 80} accent="#43e97b" delay={0.1} />
                <MetricBar label="Experience" value={plan.metrics?.experience || 90} accent="#f093fb" delay={0.2} />
                <MetricBar label="Regret Risk" value={plan.metrics?.regretRisk || 10} isRisk delay={0.3} />
              </div>

              <div className="pd-divider" />

              <div className="pd-crew">
                <div className="pd-crew-header">
                  <div className="pd-section-label">TRIP CREW</div>
                  <motion.button
                    className="pd-invite-btn"
                    onClick={() => setShowCollabModal(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Invite
                  </motion.button>
                </div>
                <div className="pd-avatars">
                  {['AR', 'PR', 'VK', 'ME'].slice(0, Math.min(4, totalPeople)).map((initials, idx) => (
                    <div
                      key={idx}
                      className="pd-avatar"
                      style={{ background: `hsl(${idx * 80 + 200}, 65%, 55%)` }}
                      title={initials}
                    >
                      {initials}
                    </div>
                  ))}
                  {totalPeople > 4 && <span className="pd-crew-count">+{totalPeople - 4} traveling</span>}
                  {totalPeople <= 4 && totalPeople > 0 && <span className="pd-crew-count">traveling</span>}
                </div>
              </div>

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
                onClick={() => {
                  const section = document.querySelector('.itinerary-refine-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Tweak this route
              </motion.button>
            </div>
          </div>
        </div>

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
                <motion.span className="refine-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
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

      <CollaboratorModal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
        tripId={tripId}
        isOwner={true}
      />
    </motion.div>
  )
}