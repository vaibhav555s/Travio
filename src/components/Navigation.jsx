import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MenuIcon, CloseIcon } from './SVGIcons'
import StepIndicator from './StepIndicator'
import ProfileDropdown from './ProfileDropdown'
import { useAuth } from '../context/AuthContext'
import './Navigation.css'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [travelerCount, setTravelerCount] = useState(1)
  const location = useLocation()
  const { isLoggedIn } = useAuth()

  const refreshTravelerCount = () => {
    const saved = sessionStorage.getItem('tripSetupData')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.travelers) setTravelerCount(parsed.travelers)
      } catch (e) {
        console.error('Failed to parse trip setup data', e)
      }
    }
  }

  const getStepIndex = () => {
    if (location.pathname.includes('setup')) return 0
    if (location.pathname.includes('crew')) return 1
    if (location.pathname.includes('plans') || location.pathname.includes('plan-detail')) return 2
    if (location.pathname.includes('dashboard')) return 3
    return -1
  }

  const currentStep = getStepIndex()
  const showNewNav = currentStep >= 0

  // These pages have light backgrounds, so we force the "scrolled" (solid) navbar state for visibility
  const isSolidPage = ['/trips', '/teams', '/home'].some(p =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  )

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('tripDataUpdated', refreshTravelerCount)
    refreshTravelerCount()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('tripDataUpdated', refreshTravelerCount)
    }
  }, [location.pathname])

  if (showNewNav) {
    return (
      <nav className="navbar-new">
        <div className="navbar-new-container">
          <Link to="/" className="navbar-logo-new">Radiator Routes</Link>
          <StepIndicator currentStep={currentStep} />
          <div className="navbar-right-new">
            <div className="crew-badge">{travelerCount} traveler{travelerCount > 1 ? 's' : ''}</div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`navbar ${(isScrolled || isSolidPage) ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo text-title">
          Radiator Routes
        </Link>

        <div className="nav-menu">
          <Link to="/#explore" className="nav-link text-body-sm">Explore</Link>
          <Link to="/#how-it-works" className="nav-link text-body-sm">How It Works</Link>
          <Link to="/#about" className="nav-link text-body-sm">About</Link>
        </div>

        <div className="nav-actions">
          {/* Sign In only visible when logged out */}
          {!isLoggedIn && (
            <Link to="/login" className="nav-sign-in text-body-sm" style={{ textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
          <Link to="/setup" className="nav-btn-primary text-body-sm">
            Plan Your Trip
          </Link>
          {/* Avatar — only when logged in */}
          {isLoggedIn && <ProfileDropdown />}
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
          <Link to="/#explore" className="mobile-link text-body-sm" onClick={() => setIsMobileMenuOpen(false)}>Explore</Link>
          <Link to="/#how-it-works" className="mobile-link text-body-sm" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
          <Link to="/#about" className="mobile-link text-body-sm" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          {!isLoggedIn && (
            <Link to="/login" className="mobile-sign-in text-body-sm" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
              Sign In
            </Link>
          )}
          <Link to="/setup" className="mobile-btn-primary text-body-sm">
            Plan Your Trip
          </Link>
          {isLoggedIn && (
            <Link to="/home" className="mobile-link text-body-sm" onClick={() => setIsMobileMenuOpen(false)}>
              My Dashboard
            </Link>
          )}
        </motion.div>
      )}
    </nav>
  )
}

export default Navigation
