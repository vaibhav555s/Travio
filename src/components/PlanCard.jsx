import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './PlanCard.css'

/** Accent colors assigned per option id to keep visual variety */
const ACCENTS = {
  recommended: '#E8631A',
  high_energy: '#C44A6B',
  budget_friendly: '#4A9E6B',
}

/** Stock photos per plan style */
const PHOTOS = {
  recommended: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  high_energy: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  budget_friendly: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80',
}

/** Badge labels per option id */
const BADGES = {
  recommended: 'RECOMMENDED',
  high_energy: 'HIGH ENERGY',
  budget_friendly: 'BUDGET FRIENDLY',
}

const PlanCard = ({ plan, isRecommended = false }) => {
  const navigate = useNavigate()
  const accent = ACCENTS[plan.id] || '#E8631A'
  const photo = PHOTOS[plan.id] || PHOTOS.recommended
  const badge = BADGES[plan.id] || plan.title?.toUpperCase()

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
        <img src={photo} alt={plan.title} />
        <div className="photo-gradient" />
        <div className="badge">{badge}</div>
        <div className="card-photo-content">
          <h3 className="text-display plan-name">{plan.title}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <p className="plan-tagline">{plan.shortDescription}</p>

        {/* AI Note */}
        <div className="ai-note" style={{ borderLeftColor: accent }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: accent }}>
            <circle cx="8" cy="2" r="1" fill="currentColor" />
            <circle cx="14" cy="6" r="0.5" fill="currentColor" opacity="0.7" />
            <circle cx="2" cy="6" r="0.5" fill="currentColor" opacity="0.7" />
          </svg>
          <p>AI-curated itinerary tailored to your travel style and budget.</p>
        </div>

        {/* Highlights */}
        <div className="highlights-strip">
          {(plan.highlights || []).map((highlight, idx) => (
            <span key={idx} className="highlight-pill">
              {highlight}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="view-itinerary-btn"
          style={{ backgroundColor: accent }}
          onClick={() => navigate(`/plans/${plan.id}`)}
        >
          View full itinerary →
        </button>
      </div>
    </motion.div>
  )
}

export default PlanCard
