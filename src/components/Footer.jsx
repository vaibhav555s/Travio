import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Footer.css'

const SOCIAL = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
]

const NAV_COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Plan a Trip', to: '/setup' },
      { label: 'My Trips', to: '/trips' },
      { label: 'Dashboard', to: '/home' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Destinations', to: '/#explore' },
      { label: 'Scenic Routes', to: '/#explore' },
      { label: 'Travel Guides', to: '/#explore' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/#about' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
]

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">

      {/* Top accent bar */}
      <div className="footer-accent-bar" />

      <div className="container footer-body">

        {/* Brand column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">Radiator Routes</Link>
          <p className="footer-tagline">
            AI-powered travel planning for explorers who live for the scenic route.
          </p>

          {/* Social icons */}
          <div className="footer-socials">
            {SOCIAL.map(s => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label={s.label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {NAV_COLS.map(col => (
          <div key={col.heading} className="footer-col">
            <p className="footer-col-heading">{col.heading}</p>
            <ul className="footer-col-links">
              {col.links.map(l => (
                <li key={l.label}>
                  {l.to
                    ? <Link to={l.to} className="footer-link">{l.label}</Link>
                    : <a href={l.href} className="footer-link">{l.label}</a>
                  }
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">© {year} Radiator Routes. Built with ❤️ for wanderers.</p>
          <div className="footer-legal">
            <a href="#" className="footer-link-sm">Privacy</a>
            <a href="#" className="footer-link-sm">Terms</a>
            <a href="#" className="footer-link-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
