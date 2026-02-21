import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './AuthPage.css'

const AuthPage = ({ children, title, subtitle, switchText, switchLink, switchLabel }) => {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <img
          src="https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1600&h=900&fit=crop"
          alt="Scenic road"
          className="auth-bg-image"
        />
        <div className="auth-overlay" />
      </div>

      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="auth-logo text-display">Radiator</Link>
          <h2 className="text-title auth-title">{title}</h2>
          <p className="text-body-sm auth-subtitle">{subtitle}</p>

          {children}

          <p className="auth-switch text-body-sm">
            {switchText}{' '}
            <Link to={switchLink} className="auth-switch-link">{switchLabel}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage