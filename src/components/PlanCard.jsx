import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MetricBar from './MetricBar'
import './PlanCard.css'

const PlanCard = ({ plan, isRecommended = false }) => {
  const navigate = useNavigate()

  return (
    <motion.div
      className={`plan-card ${isRecommended ? 'recommended' : ''}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
    >
      {/* Card Photo Section */}
      <div className="card-photo">
        <img src={plan.photo} alt={plan.name} />
        <div className="photo-gradient" />

        <div className="badge">{plan.badge}</div>

        <div className="card-photo-content">
          <h3 className="text-display plan-name">{plan.name}</h3>
          <p className="plan-cost">{plan.totalCost}</p>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <p className="plan-tagline">{plan.tagline}</p>

        {/* Metrics */}
        <div className="metrics-section">
          <h4 className="metrics-label">ROUTE METRICS</h4>
          <div className="metrics-grid">
            <MetricBar label="Budget" value={plan.metrics.budget} accent={plan.accent} delay={0} />
            <MetricBar label="Energy" value={plan.metrics.energy} accent={plan.accent} delay={0.1} />
            <MetricBar label="Experience" value={plan.metrics.experience} accent={plan.accent} delay={0.2} />
            <MetricBar label="Regret Risk" value={plan.metrics.regretRisk} accent={plan.accent} delay={0.3} />
          </div>
        </div>

        {/* AI Note */}
        <div className="ai-note" style={{ borderLeftColor: plan.accent }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: plan.accent }}>
            <circle cx="8" cy="2" r="1" fill="currentColor" />
            <circle cx="14" cy="6" r="0.5" fill="currentColor" opacity="0.7" />
            <circle cx="2" cy="6" r="0.5" fill="currentColor" opacity="0.7" />
          </svg>
          <p>{plan.aiNote}</p>
        </div>

        {/* Highlights */}
        <div className="highlights-strip">
          {plan.highlights.map((highlight, idx) => (
            <span key={idx} className="highlight-pill">
              {highlight}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="view-itinerary-btn"
          style={{ backgroundColor: plan.accent }}
          onClick={() => navigate(`/plans/${plan.id}`)}
        >
          View full itinerary →
        </button>
      </div>
    </motion.div>
  )
}

export default PlanCard
