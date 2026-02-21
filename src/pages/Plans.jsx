import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PlanCard from '../components/PlanCard'
import { mockPlans, mockCrewData } from '../data/mockPlans'
import './Plans.css'

const Plans = () => {
  const avatarColors = ['#E8631A', '#4A9EDB', '#E8A21A', '#6B9E4A']

  return (
    <main className="plans-page">
      <div className="plans-header">
        <motion.div
          className="header-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-label">YOUR ROUTES ARE READY</div>
          <h1 className="text-display header-title">3 routes found for your crew.</h1>
          <p className="text-lead header-subtitle">Balanced differently for your group. Compare and choose.</p>
        </motion.div>

        <motion.div
          className="header-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="crew-summary">
            <div className="avatars">
              {mockCrewData.travelers.map((traveler, idx) => (
                <div
                  key={idx}
                  className="summary-avatar"
                  style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                >
                  {traveler.name.charAt(0)}
                </div>
              ))}
            </div>
            <div className="summary-text">
              <p className="text-body-sm">{mockCrewData.travelers.length} travelers · {mockCrewData.destination} · {mockCrewData.duration} days</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="plans-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {mockPlans.map((plan, idx) => (
          <PlanCard key={plan.id} plan={plan} isRecommended={idx === 0} />
        ))}
      </motion.div>

      <motion.div
        className="plans-footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Link to="/crew" className="back-link">
          ← Edit crew preferences
        </Link>
      </motion.div>
    </main>
  )
}

export default Plans
