import { motion } from 'framer-motion'
import './ActivityCard.css'

const activityTypeColors = {
  hotel: '#4A9EDB',
  beach: '#4A9E6B',
  food: '#E8631A',
  adventure: '#C44A6B',
  culture: '#7A5CE8',
  nightlife: '#E8A21A',
}

const energyColors = {
  'Low': '#4A9E6B',
  'Medium': '#E8A21A',
  'High': '#C44A6B',
}

export default function ActivityCard({ activity, isPast = false, isCurrent = false, connector = false }) {
  return (
    <>
      {connector && <div className="activity-connector" />}
      <motion.div
        className={`activity-card ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          '--strip-color': activityTypeColors[activity.type] || '#E8631A',
        }}
      >
        <div className="activity-left-strip" />
        
        <div className="activity-content">
          <div className="activity-time-section">
            <span className="activity-time">{activity.time}</span>
          </div>

          <div className="activity-main">
            <h4 className="activity-name">{activity.name}</h4>
            <p className="activity-type">{activity.type}</p>
          </div>

          <div className="activity-badges">
            <span
              className="activity-energy"
              style={{ background: energyColors[activity.energy] || '#E8631A' }}
            >
              {activity.energy}
            </span>
            <span className="activity-cost">{activity.cost}</span>
          </div>
        </div>

        {isCurrent && <div className="activity-now-badge">● NOW</div>}
        {isPast && <div className="activity-checkmark">✓</div>}
      </motion.div>
    </>
  )
}
