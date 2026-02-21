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
  const plan = mockPlans.find(p => p.id === planId) || mockPlans[0]
  
  const [selectedDay, setSelectedDay] = useState(1)
  const [showWhatIf, setShowWhatIf] = useState(false)

  const currentDayData = plan.days.find(d => d.day === selectedDay) || plan.days[0]
  const totalPeople = 4

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

      <WhatIfDrawer isOpen={showWhatIf} onClose={() => setShowWhatIf(false)} />
    </motion.div>
  )
}
