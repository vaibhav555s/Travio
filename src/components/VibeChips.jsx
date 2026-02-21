import { motion } from 'framer-motion'
import {
  MountainIcon,
  CultureIcon,
  FoodieIcon,
  NightlifeIcon,
  NatureIcon,
  WaveIcon,
} from './SVGIcons'
import './VibeChips.css'

const VibeChips = ({ selected, onChange }) => {
  const vibes = [
    { id: 'adventure', label: 'Adventure', icon: MountainIcon },
    { id: 'culture', label: 'Culture', icon: CultureIcon },
    { id: 'foodie', label: 'Foodie', icon: FoodieIcon },
    { id: 'nightlife', label: 'Nightlife', icon: NightlifeIcon },
    { id: 'nature', label: 'Nature', icon: NatureIcon },
    { id: 'relaxed', label: 'Relaxed', icon: WaveIcon },
  ]

  const handleToggle = (vibeId) => {
    if (selected.includes(vibeId)) {
      onChange(selected.filter((id) => id !== vibeId))
    } else {
      onChange([...selected, vibeId])
    }
  }

  return (
    <div className="form-field">
      <label className="text-label form-label">Trip Vibe</label>
      <p className="text-body-sm vibe-hint">
        Select all that match your style
      </p>

      <div className="vibe-chips-grid">
        {vibes.map((vibe) => {
          const Icon = vibe.icon
          const isSelected = selected.includes(vibe.id)

          return (
            <motion.button
              key={vibe.id}
              onClick={() => handleToggle(vibe.id)}
              className={`vibe-chip ${isSelected ? 'selected' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
              }}
            >
              {isSelected && (
                <motion.div
                  className="chip-bg"
                  layoutId="chipBg"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              <Icon
                size={24}
                color={isSelected ? 'white' : 'var(--color-accent)'}
              />
              <span className="text-body-sm chip-label">
                {vibe.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default VibeChips
