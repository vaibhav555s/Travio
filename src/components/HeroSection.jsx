import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './SVGIcons'
import ScrollSequence from './ScrollSequence'
import './HeroSection.css'

// Rotating words for the typewriter effect
const ROTATING_WORDS = ['Scenic Route', 'Himalayan Pass', 'Coastal Highway', 'Perfect Journey', 'Hidden Gem']

// Floating map pins data
const MAP_PINS = [
  { label: 'Goa', top: '32%', left: '70%', delay: 0 },
  { label: 'Manali', top: '20%', left: '55%', delay: 0.4 },
  { label: 'Coorg', top: '58%', left: '62%', delay: 0.8 },
  { label: 'Ladakh', top: '14%', left: '40%', delay: 1.1 },
  { label: 'Rishikesh', top: '26%', left: '78%', delay: 0.6 },
]

const HeroSection = () => {
  const [wordIdx, setWordIdx] = useState(0)

  // Cycle the rotating word every 2.8s
  useEffect(() => {
    const id = setInterval(() => {
      setWordIdx(i => (i + 1) % ROTATING_WORDS.length)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
  }

  return (
    <ScrollSequence>
      <section className="hero">

        {/* ── Ambient gradient orbs ── */}
        <div className="hero-orb hero-orb--amber" />
        <div className="hero-orb hero-orb--blue" />
        <div className="hero-noise" />

        {/* ── Floating destination pills ── */}
        {MAP_PINS.map((pin) => (
          <motion.div
            key={pin.label}
            className="hero-pin"
            style={{ top: pin.top, left: pin.left }}
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { delay: pin.delay + 1.2, duration: 0.5 },
              scale: { delay: pin.delay + 1.2, duration: 0.5 },
              y: { delay: pin.delay + 1.7, duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <span className="hero-pin-dot" />
            {pin.label}
          </motion.div>
        ))}

        {/* ── Main hero content ── */}
        <div className="hero-content container">
          <motion.div
            className="hero-text"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow label */}
            <motion.span className="hero-eyebrow" variants={itemVariants}>
              ✦ &nbsp;AI-Powered Travel Planning &nbsp;✦
            </motion.span>

            {/* Main headline with rotating word */}
            <motion.h1 className="hero-headline" variants={itemVariants}>
              Drive the{' '}
              <span className="hero-word-wrap">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    className="hero-rotating-word"
                    initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ROTATING_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p className="hero-sub" variants={itemVariants}>
              Tell us where, when, and how — our AI builds your perfect itinerary in seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div className="hero-buttons" variants={itemVariants}>
              <Link to="/setup" className="btn-primary">
                <span>Start Planning</span>
                <ArrowRightIcon size={20} />
              </Link>
              <button className="btn-secondary">
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Floating stats bar */}
            <motion.div className="hero-stats-bar" variants={itemVariants}>
              <div className="hero-stat">
                <span className="hero-stat-num">50K+</span>
                <span className="hero-stat-label">Trips Planned</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">200+</span>
                <span className="hero-stat-label">Scenic Routes</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">4.9★</span>
                <span className="hero-stat-label">User Rating</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">48</span>
                <span className="hero-stat-label">Countries</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          className="hero-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          <div className="hero-scroll-mouse">
            <div className="hero-scroll-wheel" />
          </div>
          <span>Scroll to explore</span>
        </motion.div>

      </section>
    </ScrollSequence>
  )
}

export default HeroSection
