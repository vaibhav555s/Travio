import { motion } from 'framer-motion'
import './SocialProofStrip.css'

const AVATARS = [
  { initials: 'AK', hue: 220 },
  { initials: 'RS', hue: 15 },
  { initials: 'MJ', hue: 160 },
  { initials: 'PD', hue: 280 },
  { initials: 'ST', hue: 45 },
]

const STATS = [
  { num: '50K+', label: 'Trips Planned', icon: '🗺️' },
  { num: '4.9★', label: 'Avg Rating', icon: '⭐' },
  { num: '200+', label: 'Scenic Routes', icon: '🏔️' },
  { num: '48', label: 'Countries', icon: '🌍' },
]

const SocialProofStrip = () => {
  return (
    <section className="social-proof">
      <div className="container">
        <motion.div
          className="sp-inner"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65 }}
        >
          {/* Left — stacked avatars + label */}
          <div className="sp-social">
            <div className="sp-avatars">
              {AVATARS.map((a, i) => (
                <div
                  key={i}
                  className="sp-avatar"
                  style={{
                    background: `hsl(${a.hue}, 58%, 52%)`,
                    marginLeft: i === 0 ? 0 : -12,
                    zIndex: AVATARS.length - i,
                  }}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <div className="sp-social-text">
              <span className="sp-social-headline">Loved by travellers worldwide</span>
              <span className="sp-social-sub">Join 50,000+ happy adventurers</span>
            </div>
          </div>

          <div className="sp-divider" />

          {/* Right — stat pills */}
          <div className="sp-stats">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className="sp-stat"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <span className="sp-stat-icon">{s.icon}</span>
                <span className="sp-stat-num">{s.num}</span>
                <span className="sp-stat-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SocialProofStrip
