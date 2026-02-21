import { motion } from 'framer-motion'
import './ActivityCard.css'

const activityTheme = {
  hotel: { color: '#88a0b0', label: 'Accommodation' },
  beach: { color: '#82baa3', label: 'Beach & Nature' },
  food: { color: '#d68e72', label: 'Dining' },
  adventure: { color: '#b07f9c', label: 'Adventure' },
  culture: { color: '#9785b8', label: 'Culture' },
  nightlife: { color: '#d8aa6b', label: 'Nightlife' },
  transport: { color: '#92a8d1', label: 'Transport' },
}

export default function ActivityCard({ activity, index = 0, themeGradient }) {
  const theme = activityTheme[activity.type] || { color: '#a0a0a0', label: activity.type }

  // Split time into hours and minutes for editorial typography
  const [hours, mins] = activity.time.split(':')
  const isEven = index % 2 === 0

  return (
    <motion.div
      className={`aesthetic-act-wrap ${isEven ? 'indent-left' : 'indent-right'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="aesthetic-act-time">
        <span
          className="ac-hr"
          style={themeGradient ? {
            backgroundImage: themeGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent'
          } : {}}
        >
          {hours}
        </span>
        <span className="ac-min">{mins}</span>
      </div>

      <div className="aesthetic-act-card" style={{ '--act-color': theme.color }}>
        <div className="ac-card-bg" />

        <div className="ac-card-content">
          <div className="ac-tags">
            <span className="ac-type-pill" style={{ color: theme.color }}>{theme.label}</span>
            <span className="ac-energy-pill">
              <span className="ac-energy-dot" />
              {activity.energy} Energy
            </span>
          </div>

          <h3 className="ac-title">{activity.name}</h3>

          <div className="ac-footer">
            <span className="ac-cost-label">Cost /</span>
            <span className="ac-cost-value">{activity.cost}</span>
          </div>
        </div>

        {/* Ambient aesthetic shape */}
        <div className="ac-ambient-shape" style={{ background: theme.color }} />
      </div>
    </motion.div>
  )
}
