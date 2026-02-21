import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { TextInput, DateInput } from '../components/FormField'
import BudgetSlider from '../components/BudgetSlider'
import TravelerStepper from '../components/TravelerStepper'
import VibeChips from '../components/VibeChips'
import { MapPinIcon, CalendarIcon, ArrowRightIcon } from '../components/SVGIcons'
import './TripSetup.css'

const TripSetup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    destination: '',
    departureDate: '',
    returnDate: '',
    budget: 3000,
    travelers: 1,
    vibes: [],
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Trip setup data:', formData)
    navigate('/crew')
  }

  const progressSteps = [
    { label: 'Destination', completed: !!formData.destination },
    { label: 'Dates', completed: !!formData.departureDate && !!formData.returnDate },
    { label: 'Budget', completed: true },
    { label: 'Travelers', completed: formData.travelers > 0 },
    { label: 'Vibe', completed: formData.vibes.length > 0 },
  ]

  const completedSteps = progressSteps.filter((step) => step.completed).length
  const progressPercentage = (completedSteps / progressSteps.length) * 100

  return (
    <div className="trip-setup">
      <div className="setup-photo">
        <img
          src="https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=1200&fit=crop"
          alt="Scenic mountain road"
          className="photo-image"
        />
        <div className="photo-overlay" />
        <div className="photo-content">
          <h1 className="text-display photo-title">
            Plan Your Perfect Road Trip
          </h1>
          <p className="text-body-sm photo-text">
            Let's create an unforgettable adventure tailored to your preferences.
          </p>

          <div className="progress-dots">
            {progressSteps.map((step, idx) => (
              <motion.div
                key={idx}
                className={`dot ${step.completed ? 'completed' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <span className="text-caption">{idx + 1}</span>
              </motion.div>
            ))}
          </div>

          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <p className="text-caption progress-text">
            {completedSteps} of {progressSteps.length} sections completed
          </p>
        </div>
      </div>

      <div className="setup-form-container">
        <form onSubmit={handleSubmit} className="setup-form">
          <motion.div
            className="form-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-display">Trip Details</h2>
            <p className="text-lead">
              Tell us about your ideal road trip and we'll handle the rest.
            </p>
          </motion.div>

          <motion.div
            className="form-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="form-section">
              <TextInput
                label="Destination"
                icon={MapPinIcon}
                placeholder="e.g., San Francisco to Los Angeles"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
              />
            </div>

            <div className="form-section">
              <h3 className="text-title form-section-title">Trip Dates</h3>
              <div className="dates-grid">
                <DateInput
                  label="Departure Date"
                  icon={CalendarIcon}
                  value={formData.departureDate}
                  onChange={(e) =>
                    handleInputChange('departureDate', e.target.value)
                  }
                />
                <DateInput
                  label="Return Date"
                  icon={CalendarIcon}
                  value={formData.returnDate}
                  onChange={(e) => handleInputChange('returnDate', e.target.value)}
                />
              </div>
            </div>

            <BudgetSlider
              value={formData.budget}
              onChange={(value) => handleInputChange('budget', value)}
            />

            <TravelerStepper
              value={formData.travelers}
              onChange={(value) => handleInputChange('travelers', value)}
            />

            <VibeChips
              selected={formData.vibes}
              onChange={(vibes) => handleInputChange('vibes', vibes)}
            />
          </motion.div>

          <motion.div
            className="form-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button type="submit" className="submit-button">
              <span>Generate My Trip</span>
              <ArrowRightIcon size={20} />
            </button>

            <Link to="/" className="back-link text-body-sm">
              ← Back to home
            </Link>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

export default TripSetup
