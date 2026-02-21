import { useState } from 'react'
import { motion } from 'framer-motion'
import './TravelerCard.css'

const interests = ['Food', 'Adventure', 'History', 'Nightlife', 'Nature', 'Beaches', 'Wellness']
const avatarColors = ['#E8631A', '#4A9EDB', '#E8A21A', '#6B9E4A', '#C44A6B', '#7A5CE8']

const TravelerCard = ({ traveler, index, onUpdate, onRemove }) => {
  const [editingName, setEditingName] = useState(false)
  const [customName, setCustomName] = useState(traveler.name && !traveler.name.startsWith('Traveler ') ? traveler.name : '')
  const avatarColor = avatarColors[index % avatarColors.length]
  const displayName = customName || `Traveler ${index + 1}`

  const handleNameSave = () => {
    if (customName.trim()) {
      onUpdate({ ...traveler, name: customName })
    } else {
      // If cleared, revert to dynamic naming
      onUpdate({ ...traveler, name: `Traveler ${index + 1}` })
    }
    setEditingName(false)
  }

  const handleAgeChange = (e) => {
    const age = parseInt(e.target.value, 10)
    if (!isNaN(age) && age >= 0) {
      onUpdate({ ...traveler, age })
    } else if (e.target.value === '') {
      // Allow clearing the input temporarily
      onUpdate({ ...traveler, age: '' })
    }
  }

  const handleInterests = (interest) => {
    const currentInterests = traveler.interests || []
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i) => i !== interest)
      : [...currentInterests, interest]
    onUpdate({ ...traveler, interests: newInterests })
  }

  const initials = customName
    ? customName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : `T${index + 1}`

  return (
    <motion.div
      className="traveler-card"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        <div className="avatar" style={{ backgroundColor: avatarColor }}>
          <span>{initials}</span>
        </div>
        <div className="name-field">
          {editingName ? (
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              autoFocus
              placeholder={`Traveler ${index + 1}`}
              className="name-input"
            />
          ) : (
            <div className="name-display" onClick={() => setEditingName(true)}>
              {displayName}
            </div>
          )}
        </div>
        <button type="button" className="remove-btn" onClick={() => onRemove(traveler.id)}>
          ×
        </button>
      </div>

      <div className="card-divider" />

      <div className="age-section">
        <label className="section-label">AGE</label>
        <div className="age-input-container">
          <input
            type="number"
            className="age-input"
            value={traveler.age || ''}
            onChange={handleAgeChange}
            min="0"
            max="120"
          />
        </div>
      </div>

      <div className="interests-section">
        <label className="section-label">INTERESTS</label>
        <div className="interests-chips">
          {interests.map((interest) => (
            <motion.button
              type="button"
              key={interest}
              className={`interest-chip ${(traveler.interests || []).includes(interest) ? 'active' : ''}`}
              onClick={() => handleInterests(interest)}
              whileHover={{ scale: 1.05 }}
            >
              {interest}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default TravelerCard
