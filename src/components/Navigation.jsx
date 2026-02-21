import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MenuIcon, CloseIcon } from './SVGIcons'
import StepIndicator from './StepIndicator'
import './Navigation.css'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const getStepIndex = () => {
    if (location.pathname.includes('setup')) return 0
    if (location.pathname.includes('crew')) return 1
    if (location.pathname.includes('plans') || location.pathname.includes('plan-detail')) return 2
    if (location.pathname.includes('dashboard')) return 3
    return -1
  }

  const currentStep = getStepIndex()
  const showNewNav = currentStep >= 0

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (showNewNav) {
    return (
      <nav className="navbar-new">
        <div className="navbar-new-container">
          <Link to="/" className="navbar-logo-new">Radiator Routes</Link>
          <StepIndicator currentStep={currentStep} />
          <div className="navbar-right-new">
            <div className="crew-badge">4 travelers</div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo text-display">
          Radiator
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link text-body-sm">
            Explore
          </Link>
          <Link to="/" className="nav-link text-body-sm">
            How It Works
          </Link>
          <Link to="/" className="nav-link text-body-sm">
            About
          </Link>
        </div>

        <div className="nav-actions">
          <button className="nav-sign-in text-body-sm">
            Sign In
          </button>
          <Link to="/setup" className="nav-btn-primary text-body-sm">
            Plan Your Trip
          </Link>
        </div>

        <button
          className="nav-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <CloseIcon size={28} /> : <MenuIcon size={28} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          className="nav-mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" className="mobile-link text-body-sm">
            Explore
          </Link>
          <Link to="/" className="mobile-link text-body-sm">
            How It Works
          </Link>
          <Link to="/" className="mobile-link text-body-sm">
            About
          </Link>
          <button className="mobile-sign-in text-body-sm">
            Sign In
          </button>
          <Link to="/setup" className="mobile-btn-primary text-body-sm">
            Plan Your Trip
          </Link>
        </motion.div>
      )}
    </nav>
  )
}

export default Navigation
