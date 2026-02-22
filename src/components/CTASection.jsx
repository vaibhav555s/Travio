import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './SVGIcons'
import './CTASection.css'

const CTASection = () => {
  return (
    <section id="about" className="cta-section">
      <div className="cta-background" />

      <div className="container cta-content">
        <motion.div
          className="cta-text"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-display">Ready for Your Adventure?</h2>
          <p className="text-lead">
            Plan your perfect road trip in minutes with AI-powered route optimization.
          </p>

          <Link to="/setup" className="cta-button">
            <span>Start Your Trip Now</span>
            <ArrowRightIcon size={22} />
          </Link>
        </motion.div>

        <motion.div
          className="cta-stats"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="stat-box">
            <div className="text-lead">24/7</div>
            <p className="text-body-sm">Support</p>
          </div>
          <div className="stat-box">
            <div className="text-lead">Free</div>
            <p className="text-body-sm">Trial</p>
          </div>
          <div className="stat-box">
            <div className="text-lead">100%</div>
            <p className="text-body-sm">Secure</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection
