import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import TravelerCard from '../components/TravelerCard'
import { ArrowRightIcon } from '../components/SVGIcons'
import './Crew.css'

const Crew = () => {
  const navigate = useNavigate()
  const [travelers, setTravelers] = useState([
    { id: 1, name: 'Traveler 1', energyLevel: 3, budgetType: 'Moderate', interests: [] },
    { id: 2, name: 'Traveler 2', energyLevel: 3, budgetType: 'Moderate', interests: [] },
  ])

  const handleAddTraveler = () => {
    if (travelers.length < 6) {
      const newId = Math.max(...travelers.map((t) => t.id), 0) + 1
      setTravelers([
        ...travelers,
        {
          id: newId,
          name: `Traveler ${travelers.length + 1}`,
          energyLevel: 3,
          budgetType: 'Moderate',
          interests: [],
        },
      ])
    }
  }

  const handleRemoveTraveler = (id) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((t) => t.id !== id))
    }
  }

  const handleUpdateTraveler = (updatedTraveler) => {
    setTravelers(travelers.map((t) => (t.id === updatedTraveler.id ? updatedTraveler : t)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Crew data:', travelers)
    navigate('/processing')
  }

  return (
    <div className="crew-page">
      <div className="crew-photo">
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85"
          alt="Group of friends on a road trip"
          className="photo-image"
        />
        <div className="photo-overlay" />
        <div className="photo-content">
          <div className="step-label">STEP 2 OF 3</div>
          <h1 className="text-display photo-title">Who's coming along?</h1>
          <p className="text-body-sm photo-text">
            Each person gets a profile. The AI plans for everyone.
          </p>

          <div className="progress-dots">
            {[1, 2, 3].map((dot) => (
              <motion.div
                key={dot}
                className={`dot ${dot <= 2 ? 'active' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: dot * 0.1 }}
              >
                {dot}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="crew-form-container">
        <form onSubmit={handleSubmit} className="crew-form">
          <motion.div
            className="form-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-display form-title">Build your crew</h2>
            <p className="text-body-sm form-subtitle">Add up to 6 travelers</p>
          </motion.div>

          <motion.div
            className="crew-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="popLayout">
              {travelers.map((traveler, index) => (
                <TravelerCard
                  key={traveler.id}
                  traveler={traveler}
                  index={index}
                  onUpdate={handleUpdateTraveler}
                  onRemove={handleRemoveTraveler}
                />
              ))}
            </AnimatePresence>

            {travelers.length < 6 && (
              <motion.button
                type="button"
                className="add-traveler-btn"
                onClick={handleAddTraveler}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, borderColor: 'var(--color-accent)' }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <span>Add traveler</span>
              </motion.button>
            )}
          </motion.div>

          <motion.div
            className="form-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button type="submit" className="submit-button">
              <span>Generate my routes</span>
              <ArrowRightIcon size={20} />
            </button>
            <p className="form-caption">Takes 4–8 seconds</p>

            <Link to="/setup" className="back-link text-body-sm">
              ← Back to trip details
            </Link>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

export default Crew
