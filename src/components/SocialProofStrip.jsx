import { motion } from 'framer-motion'
import './SocialProofStrip.css'

const SocialProofStrip = () => {
  const stats = [
    { number: '50K+', label: 'Road Trips Planned' },
    { number: '200+', label: 'Scenic Routes' },
    { number: '4.9★', label: 'User Rating' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="social-proof">
      <div className="container">
        <motion.div
          className="proof-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} className="proof-item" variants={itemVariants}>
              <div className="stat-number text-display">{stat.number}</div>
              <div className="stat-label text-body-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default SocialProofStrip
