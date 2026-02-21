import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { TextInput, DateInput } from '../components/FormField'
import BudgetSlider from '../components/BudgetSlider'
import TravelerStepper from '../components/TravelerStepper'
import VibeChips from '../components/VibeChips'
import { MapPinIcon, CalendarIcon, ArrowRightIcon } from '../components/SVGIcons'
import axios from 'axios'
import './TripSetup.css'

const majorCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Chandigarh',
  'Bhopal', 'Indore', 'Nagpur', 'Kochi', 'Coimbatore', 'Visakhapatnam',
  'Guwahati', 'Bhubaneswar'
]

const popularDestinations = [
  'Goa', 'Manali', 'Leh-Ladakh', 'Jaipur', 'Rishikesh',
  'Udaipur', 'Coorg', 'Andaman', 'Varanasi', 'Darjeeling',
  'Shimla', 'Ooty', 'Munnar', 'Pondicherry', 'Agra'
]

const MapModal = ({ isOpen, onClose, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="map-modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <motion.div
            className="map-modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{
              background: 'var(--color-white)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)',
              width: '90%', maxWidth: '600px', boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)', alignItems: 'center' }}>
              <h3 className="text-title" style={{ fontSize: '1.5rem' }}>Select Destination</h3>
              <button type="button" onClick={onClose} style={{ fontSize: '1.5rem', cursor: 'pointer', padding: '4px' }}>&times;</button>
            </div>
            <div style={{
              width: '100%', height: '300px', background: '#e2e8f0',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 'var(--spacing-md)'
            }}>
              <p className="text-body-sm">Map tracking bounds: India.</p>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button type="button" onClick={() => onSelect('Mumbai to Goa')} style={{ padding: '8px 16px', background: 'var(--color-accent)', color: 'white', borderRadius: '100px', fontSize: '14px' }}>Mumbai to Goa</button>
                <button type="button" onClick={() => onSelect('Delhi to Manali')} style={{ padding: '8px 16px', background: 'var(--color-accent)', color: 'white', borderRadius: '100px', fontSize: '14px' }}>Delhi to Manali</button>
                <button type="button" onClick={() => onSelect('Bangalore to Coorg')} style={{ padding: '8px 16px', background: 'var(--color-accent)', color: 'white', borderRadius: '100px', fontSize: '14px' }}>Bangalore to Coorg</button>
                <button type="button" onClick={() => onSelect('Jaipur to Udaipur')} style={{ padding: '8px 16px', background: 'var(--color-accent)', color: 'white', borderRadius: '100px', fontSize: '14px' }}>Jaipur to Udaipur</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const TripSetup = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [errors, setErrors] = useState({})
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isSourceFocused, setIsSourceFocused] = useState(false)
  const [isDestFocused, setIsDestFocused] = useState(false)

  // ── Consistency: restore saved form state from sessionStorage ──
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('tripSetupData')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        source: parsed.source || '',
        destination: parsed.destination || '',
        departureDate: parsed.departureDate || '',
        returnDate: parsed.returnDate || '',
        budget: parsed.budget || 30000,
        travelers: parsed.travelers || 1,
        vibes: parsed.vibes || [],
      }
    }
    return {
      source: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      budget: 30000,
      travelers: 1,
      vibes: [],
    }
  })

  // ── Consistency: persist to sessionStorage on every change ──
  useEffect(() => {
    sessionStorage.setItem('tripSetupData', JSON.stringify(formData))
    window.dispatchEvent(new Event('tripDataUpdated'))
  }, [formData])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.source) newErrors.source = 'Please enter your starting city'
    if (!formData.destination) newErrors.destination = 'Please enter a destination'
    if (!formData.departureDate) newErrors.departureDate = 'Departure date is required'
    if (!formData.returnDate) newErrors.returnDate = 'Return date is required'
    if (formData.vibes.length === 0) newErrors.vibes = 'Please select at least one trip vibe'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    navigate('/crew')

  }

  const progressSteps = [
    { label: 'From', completed: !!formData.source },
    { label: 'Destination', completed: !!formData.destination },
    { label: 'Dates', completed: !!formData.departureDate && !!formData.returnDate },
    { label: 'Budget', completed: true },
    { label: 'Travelers', completed: formData.travelers > 0 },
    { label: 'Vibe', completed: formData.vibes.length > 0 },
  ]

  const completedSteps = progressSteps.filter((step) => step.completed).length
  const progressPercentage = (completedSteps / progressSteps.length) * 100

  // Filter helpers
  const filteredSources = majorCities.filter(c =>
    c.toLowerCase().includes(formData.source.toLowerCase()) && formData.source.length > 0
  )
  const filteredDests = popularDestinations.filter(d =>
    d.toLowerCase().includes(formData.destination.toLowerCase())
  )

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
            {progressSteps.map((step, idx) => {
              const isActive = idx < completedSteps
              const isCurrent = idx === completedSteps - 1
              return (
                <motion.div
                  key={idx}
                  className={`dot ${isActive ? 'completed' : ''}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  style={isActive ? {
                    background: 'var(--color-accent)',
                    borderColor: 'var(--color-accent)',
                    color: 'white',
                    boxShadow: isCurrent ? '0 0 10px rgba(217, 119, 6, 0.5)' : 'none'
                  } : {}}
                  title={step.label}
                >
                  <span className="text-caption" style={{ fontWeight: 'bold' }}>{idx + 1}</span>
                </motion.div>
              )
            })}
          </div>

          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <p className="text-caption progress-text" style={{ fontSize: '1rem' }}>
            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.2rem' }}>{completedSteps}</span> of {progressSteps.length} sections completed
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

            {/* ── SOURCE CITY ── */}
            <div className="form-section" style={{ position: 'relative' }}>
              <TextInput
                label="Starting From"
                icon={MapPinIcon}
                placeholder="e.g., Mumbai, Delhi, Pune"
                value={formData.source}
                onChange={(e) => {
                  handleInputChange('source', e.target.value)
                  if (e.target.value) setErrors(prev => ({ ...prev, source: null }))
                }}
                onFocus={() => setIsSourceFocused(true)}
                onBlur={() => setTimeout(() => setIsSourceFocused(false), 200)}
              />
              <AnimatePresence>
                {isSourceFocused && filteredSources.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                      zIndex: 10, marginTop: '8px', boxShadow: 'var(--shadow-lg)',
                      maxHeight: '200px', overflowY: 'auto'
                    }}
                  >
                    {filteredSources.map((city) => (
                      <div
                        key={city}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleInputChange('source', city)
                          setIsSourceFocused(false)
                          setErrors(prev => ({ ...prev, source: null }))
                        }}
                        style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--color-surface)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        📍 {city}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.source && <p className="error-text" style={{ color: 'var(--color-error)', marginTop: '4px', fontSize: '0.875rem' }}>{errors.source}</p>}
            </div>

            {/* ── DESTINATION ── */}
            <div className="form-section" style={{ position: 'relative' }}>
              <TextInput
                label="Destination"
                icon={MapPinIcon}
                onIconClick={() => setIsMapOpen(true)}
                placeholder="e.g., Goa, Manali, Coorg"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                onFocus={() => setIsDestFocused(true)}
                onBlur={() => setTimeout(() => setIsDestFocused(false), 200)}
              />
              <AnimatePresence>
                {isDestFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                      zIndex: 10, marginTop: '8px', boxShadow: 'var(--shadow-lg)',
                      maxHeight: '200px', overflowY: 'auto'
                    }}
                  >
                    {filteredDests.map((dest) => (
                      <div
                        key={dest}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleInputChange('destination', dest)
                          setIsDestFocused(false)
                          setErrors(prev => ({ ...prev, destination: null }))
                        }}
                        style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--color-surface)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        🏕️ {dest}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.destination && <p className="error-text" style={{ color: 'var(--color-error)', marginTop: '4px', fontSize: '0.875rem' }}>{errors.destination}</p>}
            </div>

            {/* ── DATES ── */}
            <div className="form-section">
              <h3 className="text-title form-section-title">Trip Dates</h3>
              <div className="dates-grid">
                <div>
                  <DateInput
                    label="Departure Date"
                    value={formData.departureDate}
                    onChange={(e) => {
                      handleInputChange('departureDate', e.target.value)
                      if (e.target.value) setErrors(prev => ({ ...prev, departureDate: null }))
                    }}
                  />
                  {errors.departureDate && <p className="error-text" style={{ color: 'var(--color-error)', marginTop: '4px', fontSize: '0.875rem' }}>{errors.departureDate}</p>}
                </div>
                <div>
                  <DateInput
                    label="Return Date"
                    value={formData.returnDate}
                    onChange={(e) => {
                      handleInputChange('returnDate', e.target.value)
                      if (e.target.value) setErrors(prev => ({ ...prev, returnDate: null }))
                    }}
                  />
                  {errors.returnDate && <p className="error-text" style={{ color: 'var(--color-error)', marginTop: '4px', fontSize: '0.875rem' }}>{errors.returnDate}</p>}
                </div>
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

            <div className="form-section">
              <VibeChips
                selected={formData.vibes}
                onChange={(vibes) => handleInputChange('vibes', vibes)}
              />
              {errors.vibes && <p className="error-text" style={{ color: 'var(--color-error)', marginTop: '4px', fontSize: '0.875rem' }}>{errors.vibes}</p>}
            </div>
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

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={(loc) => {
          handleInputChange('destination', loc)
          setIsMapOpen(false)
          setErrors(prev => ({ ...prev, destination: null }))
        }}
      />
    </div>
  )
}

export default TripSetup
