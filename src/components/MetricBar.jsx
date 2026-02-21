import { motion } from 'framer-motion'
import './MetricBar.css'

const MetricBar = ({ label, value, accent, delay = 0 }) => {
  const getRegretRiskColor = (val) => {
    if (val > 12) return '#E53E3E'
    if (val >= 8) return '#E8A21A'
    return '#4A9E6B'
  }

  const barColor = label === 'Regret Risk' ? getRegretRiskColor(value) : accent

  return (
    <motion.div
      className="metric-bar-container"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="metric-label">{label}</div>
      <div className="metric-content">
        <div className="metric-bar">
          <motion.div
            className="metric-fill"
            initial={{ width: 0 }}
            whileInView={{ width: `${value}%` }}
            transition={{ delay: delay + 0.3, duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-50px' }}
            style={{ backgroundColor: barColor }}
          />
        </div>
        <div className="metric-value" style={{ color: barColor }}>
          {value}%
        </div>
      </div>
    </motion.div>
  )
}

export default MetricBar
