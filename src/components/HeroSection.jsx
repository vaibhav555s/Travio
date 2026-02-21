import { motion } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './SVGIcons'
import ScrollSequence from './ScrollSequence'
import './HeroSection.css'

const HeroSection = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <ScrollSequence>
      <section className="hero">
        <div className="hero-content container">
          <motion.div
            className="hero-text"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span className="text-label" variants={itemVariants}>
              Discover Your Next Adventure
            </motion.span>

            <motion.h1 className="text-hero" variants={itemVariants}>
              Drive the <span style={{ color: '#ffe5a3' }}>Scenic Route</span>
            </motion.h1>

            <motion.div className="hero-buttons" variants={itemVariants}>
              <Link to="/setup" className="btn-primary">
                <span>Start Planning</span>
                <ArrowRightIcon size={20} />
              </Link>

              <button className="btn-secondary">
                <span>Watch Demo</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </ScrollSequence>
  )
}

export default HeroSection
