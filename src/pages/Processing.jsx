import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Processing.css'

const messages = [
  'Reading your crew profiles...',
  'Mapping destinations...',
  'Balancing energy levels...',
  'Calculating the perfect pace...',
  'Building 3 distinct routes...',
]

const Processing = () => {
  const navigate = useNavigate()
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 700)

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + (100 / 35) // Reaches 100 in 3.5 seconds
      })
    }, 100)

    const navigationTimer = setTimeout(() => {
      navigate('/plans')
    }, 3500)

    return () => {
      clearInterval(messageTimer)
      clearInterval(progressTimer)
      clearTimeout(navigationTimer)
    }
  }, [navigate])

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
          <span>Analyzing 4 traveler profiles · Goa · 5 days</span>
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
