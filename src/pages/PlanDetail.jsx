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

  // Refinement state
  const [editPrompt, setEditPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [refinedPlan, setRefinedPlan] = useState(null)
  const [refineError, setRefineError] = useState('')

  const plan = refinedPlan || originalPlan
  const currentDayData = plan.days.find(d => d.day === selectedDay) || plan.days[0]
  const totalPeople = 4
  const dayTheme = dayThemes[(selectedDay - 1) % dayThemes.length]

  const handleRefine = async () => {
    if (!editPrompt.trim()) return
    setIsRefining(true)
    setRefineError('')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${apiUrl}/api/itinerary/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: originalPlan, userRequest: editPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setRefinedPlan(data.refinedPlan)
      setSelectedDay(data.refinedPlan.days[0]?.day || 1)
    } catch (err) {
      setRefineError(err.message)
    } finally {
      setIsRefining(false)
    }
  }

  const handleReset = () => {
    setRefinedPlan(null)
    setEditPrompt('')
    setRefineError('')
    setSelectedDay(1)
  }

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
