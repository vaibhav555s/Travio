import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import './ProfileDropdown.css'

const ProfileDropdown = () => {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef(null)
    const navigate = useNavigate()

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    const handleLogout = () => {
        logout()
        setOpen(false)
        navigate('/')
    }

    const navItems = [
        { icon: '📊', label: 'Dashboard', to: '/home' },
        { icon: '🗺️', label: 'My Trips', to: '/trips' },
        { icon: '🤝', label: 'Teams', to: '/teams' },
    ]

    return (
        <div className="profile-dropdown-wrapper" ref={wrapperRef}>
            <button
                className="profile-avatar-btn"
                onClick={() => setOpen(v => !v)}
                title={user?.name}
                aria-label="Profile menu"
            >
                {initials}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="profile-dropdown"
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.15 }}
                    >
                        {/* User info */}
                        <div className="dropdown-user-info">
                            <p className="dropdown-user-name">👤 {user?.name || 'Traveler'}</p>
                            <p className="dropdown-user-email">{user?.email || ''}</p>
                        </div>

                        {/* Nav links */}
                        <div className="dropdown-nav">
                            {navItems.map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="dropdown-item"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="dropdown-icon">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="dropdown-divider" />

                        {/* Logout */}
                        <div className="dropdown-nav">
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <span className="dropdown-icon">🚪</span>
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProfileDropdown
