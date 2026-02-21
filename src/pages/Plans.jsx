import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PlanCard from '../components/PlanCard'
import { mockPlans } from '../data/mockPlans'
import './Plans.css'

const Plans = () => {
  const avatarColors = ['#E8631A', '#4A9EDB', '#E8A21A', '#6B9E4A']
  const [tripInfo, setTripInfo] = useState({ travelers: 1, destination: 'Goa', days: 5, mockTravelersList: [{ name: 'T1' }] })

  useEffect(() => {
    const saved = sessionStorage.getItem('tripSetupData')
    if (saved) {
      const data = JSON.parse(saved)
      let calculatedDays = 1
      if (data.departureDate && data.returnDate) {
        const start = new Date(data.departureDate)
        const end = new Date(data.returnDate)
        const diffTime = Math.abs(end - start)
        calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      }

      const count = data.travelers || 1;
      const mockList = Array.from({ length: count }, (_, i) => ({ name: `T${i + 1}` }));

      setTripInfo({
        travelers: count,
        destination: data.destination || 'your destination',
        days: calculatedDays,
        mockTravelersList: mockList
      })
    }
  }, [])

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
              {tripInfo.mockTravelersList.slice(0, 4).map((traveler, idx) => (
                <div
                  key={idx}
                  className="summary-avatar"
                  style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                >
                  {traveler.name.charAt(0)}
                </div>
              ))}
              {tripInfo.travelers > 4 && (
                <div className="summary-avatar" style={{ backgroundColor: '#666' }}>
                  +{tripInfo.travelers - 4}
                </div>
              )}
            </div>
            <div className="summary-text">
              <p className="text-body-sm">{tripInfo.travelers} traveler{tripInfo.travelers > 1 ? 's' : ''} · {tripInfo.destination} · {tripInfo.days} day{tripInfo.days > 1 ? 's' : ''}</p>
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
