import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Processing.css'

const messages = [
  'Reading your trip preferences...',
  'Consulting Gemini AI...',
  'Mapping destination highlights...',
  'Balancing budget and experiences...',
  'Building 3 distinct routes...',
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Processing = () => {
  const navigate = useNavigate()
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [tripInfo, setTripInfo] = useState({ travelers: 1, destination: 'your destination', days: 1 })
  const [error, setError] = useState(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('tripSetupData')
    let tripData = null

    if (saved) {
      tripData = JSON.parse(saved)
      let calculatedDays = 1
      if (tripData.departureDate && tripData.returnDate) {
        const start = new Date(tripData.departureDate)
        const end = new Date(tripData.returnDate)
        const diffTime = Math.abs(end - start)
        calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      }
      setTripInfo({
        travelers: tripData.travelers || 1,
        destination: tripData.destination || 'your destination',
        days: calculatedDays
      })
    }

    // Cycle through messages every 700ms
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 700)

    // Animate progress bar up to ~90% while waiting for API
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90
        return prev + 1.5
      })
    }, 100)

    // Call Gemini via backend
    const fetchOptions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/generate-options`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tripData || {}),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Server error')
        }

        const data = await response.json()

        // Store AI-generated options for Plans page
        sessionStorage.setItem('generatedOptions', JSON.stringify(data.options || []))

        // Complete progress bar then navigate
        setProgress(100)
        setTimeout(() => navigate('/plans'), 500)
      } catch (err) {
        console.error('Processing error:', err)
        setError(err.message || 'Something went wrong. Please try again.')
        clearInterval(progressTimer)
      }
    }

    fetchOptions()

    return () => {
      clearInterval(messageTimer)
      clearInterval(progressTimer)
    }
  }, [navigate])

  if (error) {
    return (
      <div className="processing-page">
        <div className="processing-background" />
        <div className="processing-glow" />
        <motion.div
          className="processing-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ textAlign: 'center', color: 'white' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Oops! Something went wrong</h2>
            <p style={{ opacity: 0.8, marginBottom: '1.5rem', maxWidth: '400px' }}>{error}</p>
            <button
              onClick={() => navigate('/setup')}
              style={{
                background: 'var(--color-accent)', color: 'white',
                border: 'none', borderRadius: '100px', padding: '12px 24px',
                fontSize: '1rem', cursor: 'pointer'
              }}
            >
              ← Back to Trip Setup
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="processing-page">
      <div className="processing-background" />
      <div className="processing-glow" />

      <motion.div
        className="processing-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="progress-ring-container">
          <svg width="160" height="160" viewBox="0 0 160 160" className="progress-svg">
            <circle
              cx="80"
              cy="80"
              r="78"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="78"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeDasharray={2 * Math.PI * 78}
              strokeDashoffset={2 * Math.PI * 78}
              animate={{ strokeDashoffset: 2 * Math.PI * 78 * (1 - progress / 100) }}
              strokeLinecap="round"
              transition={{ duration: 0.05 }}
            />
          </svg>
          <div className="ring-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-accent)">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
        </div>

        <motion.div
          key={messageIndex}
          className="processing-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          {messages[messageIndex]}
        </motion.div>

        <div className="processing-details">
          <span>Analyzing {tripInfo.travelers} traveler profile{tripInfo.travelers > 1 ? 's' : ''} · {tripInfo.destination} · {tripInfo.days} day{tripInfo.days > 1 ? 's' : ''}</span>
        </div>

        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default Processing
