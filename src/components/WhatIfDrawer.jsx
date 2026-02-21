import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BudgetSlider from './BudgetSlider'
import './WhatIfDrawer.css'

export default function WhatIfDrawer({ isOpen, onClose }) {
  const [budget, setBudget] = useState(32000)
  const [maxEnergy, setMaxEnergy] = useState(3)
  const [pace, setPace] = useState('balanced')
  const [toggles, setToggles] = useState({
    nightlife: true,
    adventure: true,
    culture: true,
  })

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleApply = () => {
    console.log('Applied adjustments:', { budget, maxEnergy, pace, toggles })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="whatif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }}
          />

          {/* Drawer */}
          <motion.div
            className="whatif-drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Drag Handle */}
            <div className="drawer-handle-area">
              <div className="drawer-handle" />
            </div>

            {/* Content */}
            <div className="drawer-content">
              <h2 className="drawer-title">Adjust your route</h2>
              <p className="drawer-subtitle">Changes apply instantly across all 3 routes.</p>

              {/* Controls Grid */}
              <div className="controls-grid">
                {/* Control 1: Budget */}
                <div className="control-section">
                  <label className="control-label">TOTAL BUDGET</label>
                  <BudgetSlider value={budget} onChange={setBudget} />
                </div>

                {/* Control 2: Energy */}
                <div className="control-section">
                  <label className="control-label">MAX ENERGY PER DAY</label>
                  <div className="energy-selector">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        className={`energy-box ${maxEnergy >= level ? 'active' : ''}`}
                        onClick={() => setMaxEnergy(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control 3: Toggles */}
                <div className="control-section">
                  <label className="control-label">INCLUDE IN PLANS</label>
                  <div className="toggle-rows">
                    {Object.entries(toggles).map(([key, value]) => (
                      <div key={key} className="toggle-row">
                        <span className="toggle-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <button
                          className={`toggle-switch ${value ? 'on' : 'off'}`}
                          onClick={() => handleToggle(key)}
                        >
                          <div className="toggle-thumb" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Control 4: Pace */}
                <div className="control-section">
                  <label className="control-label">TRAVEL PACE</label>
                  <div className="pace-segmented">
                    {['easy', 'balanced', 'fast'].map(option => (
                      <button
                        key={option}
                        className={`pace-option ${pace === option ? 'active' : ''}`}
                        onClick={() => setPace(option)}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <motion.button
                className="button-apply"
                onClick={handleApply}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Recalculate routes →
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
