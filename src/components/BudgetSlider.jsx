import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './BudgetSlider.css'

const BudgetSlider = ({ value, onChange, min = 5500, max = 200000, step = 100 }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  const percentage = ((value - min) / (max - min)) * 100

  // Sync internal input value with external value unless user is actively typing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value)
    }
  }, [value, isEditing])

  const handleBlur = () => {
    let parsed = Number(inputValue)
    if (isNaN(parsed) || parsed < 0) parsed = min

    // Clamp to min/max
    parsed = Math.min(Math.max(parsed, min), max)

    // Nearest step
    parsed = Math.round(parsed / step) * step

    onChange(parsed)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  const formatCurrency = (val) => {
    return `₹${val.toLocaleString('en-IN')}`
  }

  return (
    <div className="form-field">
      <label className="text-label form-label">Budget</label>
      <div className="budget-slider-wrapper">
        <div className="budget-display">
          {isEditing ? (
            <div className="budget-input-wrapper">
              <span className="text-display budget-currency-symbol">₹</span>
              <input
                autoFocus
                type="number"
                className="budget-amount-input text-display"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                min={min}
                max={max}
              />
            </div>
          ) : (
            <motion.div
              className="budget-amount text-display"
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsEditing(true)}
              title="Click to type exact budget"
            >
              {formatCurrency(value)}
            </motion.div>
          )}
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
