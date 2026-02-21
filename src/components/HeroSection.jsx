import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ScrollIndicator, ArrowRightIcon } from './SVGIcons'
import './HeroSection.css'

const HeroSection = () => {
  const ref = useRef(null)

  // Parallax scroll setup
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // The background will move at half the speed of the scroll
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

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

  const scrollIndicatorVariants = {
    animate: {
      y: [0, 8, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  }

  return (
    <section className="hero" ref={ref}>
      <motion.div
        className="hero-background"
        style={{ y: backgroundY }}
      >
        <img
          src="https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1600&h=900&fit=crop"
          alt="Scenic road trip"
          className="hero-image"
        />
        <div className="hero-overlay" />
      </motion.div>

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
            Drive the <span className="text-gradient">Scenic Route</span>
          </motion.h1>

          <motion.p className="text-lead" variants={itemVariants}>
            <span className="text-gradient">AI-powered</span> road trip planning. Explore hidden gems, scenic drives, and unforgettable destinations along the radiator routes.
          </motion.p>

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

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div variants={scrollIndicatorVariants} animate="animate">
            <ScrollIndicator size={24} color="rgba(255, 255, 255, 0.6)" />
          </motion.div>
          <span className="text-caption">Scroll to explore</span>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
