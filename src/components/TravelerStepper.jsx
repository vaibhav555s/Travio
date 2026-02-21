import { motion } from 'framer-motion'
import './TravelerStepper.css'

const TravelerStepper = ({ value, onChange, min = 1, max = 12 }) => {
  const increment = () => {
    if (value < max) onChange(value + 1)
  }

  const decrement = () => {
    if (value > min) onChange(value - 1)
  }

  return (
    <div className="form-field">
      <label className="text-label form-label">Number of Travelers</label>
      <div className="stepper-wrapper">
        <button
          onClick={decrement}
          disabled={value <= min}
          className="stepper-btn stepper-minus"
          aria-label="Decrease travelers"
        >
          −
        </button>

        <motion.div
          className="stepper-display text-display"
          key={value}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {value}
        </motion.div>

        <button
          onClick={increment}
          disabled={value >= max}
          className="stepper-btn stepper-plus"
          aria-label="Increase travelers"
        >
          +
        </button>
      </div>

      <p className="text-caption stepper-hint">
        {value === 1 ? 'Solo adventure' : `${value} people`}
      </p>
    </div>
  )
}

export default TravelerStepper
