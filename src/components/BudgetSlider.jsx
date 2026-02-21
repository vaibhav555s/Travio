import { useState } from 'react'
import { motion } from 'framer-motion'
import './BudgetSlider.css'

const BudgetSlider = ({ value, onChange, min = 5000, max = 200000, step = 1000 }) => {
  const [isDragging, setIsDragging] = useState(false)
  const percentage = ((value - min) / (max - min)) * 100

  const formatCurrency = (val) => {
    return `₹${val.toLocaleString('en-IN')}`
  }

  return (
    <div className="form-field">
      <label className="text-label form-label">Budget</label>
      <div className="budget-slider-wrapper">
        <div className="budget-display">
          <motion.div
            className="budget-amount text-display"
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatCurrency(value)}
          </motion.div>
          <span className="budget-label text-body-sm">for your trip</span>
        </div>

        <div className="slider-track">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="budget-range-input"
            style={{
              background: `linear-gradient(to right, var(--color-accent) ${percentage}%, var(--color-border) ${percentage}%)`
            }}
          />
        </div>

        <div className="budget-range">
          <span className="text-caption">{formatCurrency(min)}</span>
          <span className="text-caption">{formatCurrency(max)}</span>
        </div>
      </div>
    </div>
  )
}

export default BudgetSlider
