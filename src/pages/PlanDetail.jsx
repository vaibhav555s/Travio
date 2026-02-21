import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { mockPlans } from '../data/mockPlans'
import ActivityCard from '../components/ActivityCard'
import MetricBar from '../components/MetricBar'
import WhatIfDrawer from '../components/WhatIfDrawer'
import './PlanDetail.css'

export default function PlanDetail() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const originalPlan = mockPlans.find(p => p.id === planId) || mockPlans[0]

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
    >
      {/* Hero Header */}
      <div
        className="plan-detail-hero"
        style={{ backgroundImage: `url(${plan.photo})` }}
      >
        <div className="plan-detail-overlay" />
        <div className="plan-detail-header-content">
          <button className="back-button" onClick={() => navigate('/plans')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L4 8L10 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Back to routes</span>
          </button>
          <h1 className="plan-detail-title">{plan.name}</h1>
          <div className="plan-meta-pills">
            <div className="meta-pill">{plan.nights} Nights</div>
            <div className="meta-pill">{totalPeople} Travelers</div>
            <div className="meta-pill">{plan.totalCost} total</div>
            {refinedPlan && <div className="meta-pill meta-pill-refined">✦ AI Refined</div>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="plan-detail-main">
        {/* Left Column: Itinerary */}
        <div className="plan-detail-left">
          <div className="day-selector">
            {plan.days.map(day => (
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
              {currentDayData.activities.map((activity, idx) => (
                <div key={idx}>
                  <ActivityCard
                    activity={activity}
                    connector={idx < currentDayData.activities.length - 1}
                  />
                </div>
              ))}

              <div className="ai-day-note">
                <p>{plan.aiNote}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Sticky Panel */}
        <div className="plan-detail-right">
          <div className="summary-card">
            <div className="total-cost">{plan.totalCost}</div>
            <p className="per-person">₹{(32000 / totalPeople).toLocaleString()} per person</p>

            <div className="summary-divider" />

            <div className="metric-rows">
              <MetricBar label="Budget" value={plan.metrics.budget} />
              <MetricBar label="Energy" value={plan.metrics.energy} />
              <MetricBar label="Experience" value={plan.metrics.experience} />
              <MetricBar label="Regret Risk" value={plan.metrics.regretRisk} isRisk />
            </div>

            <div className="summary-divider" />

            <div className="crew-avatars">
              {['AR', 'PR', 'VK', 'ME'].map((initials, idx) => (
                <div key={idx} className="crew-avatar" style={{ '--avatar-color': `hsl(${idx * 80}, 65%, 55%)` }}>
                  {initials}
                </div>
              ))}
            </div>

            <motion.button
              className="button button-primary"
              onClick={() => navigate('/dashboard')}
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

      {/* ─── AI Refine Section ─── */}
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
                  <>
                    <span className="refine-spinner" />
                    Applying…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    Apply Changes
                  </>
                )}
              </motion.button>

              {refinedPlan && (
                <motion.button
                  className="refine-reset-btn"
                  onClick={handleReset}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  ↺ Reset to original
                </motion.button>
              )}
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

      <WhatIfDrawer isOpen={showWhatIf} onClose={() => setShowWhatIf(false)} />
    </motion.div>
  )
}
