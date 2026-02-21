import { Link } from 'react-router-dom'
import './Footer.css'

const SocialIcon = ({ name, url }) => {
  const iconMap = {
    instagram: 'instagram.com',
    twitter: 'twitter.com',
    facebook: 'facebook.com',
    linkedin: 'linkedin.com',
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="social-icon"
      aria-label={name}
      title={name}
    >
      <span>{name[0].toUpperCase()}</span>
    </a>
  )
}

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <Link to="/" className="footer-logo text-display">
            Radiator
          </Link>
          <p className="text-body-sm">
            AI-powered road trip planning for the scenic route lover.
          </p>
          <div className="social-links">
            <SocialIcon name="Instagram" url="https://instagram.com" />
            <SocialIcon name="Twitter" url="https://twitter.com" />
            <SocialIcon name="Facebook" url="https://facebook.com" />
            <SocialIcon name="LinkedIn" url="https://linkedin.com" />
          </div>
        </div>

        <div className="footer-section">
          <h4 className="text-label footer-title">Product</h4>
          <ul className="footer-links">
            <li>
              <a href="#features" className="text-body-sm">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="text-body-sm">
                Pricing
              </a>
            </li>
            <li>
              <a href="#security" className="text-body-sm">
                Security
              </a>
            </li>
            <li>
              <a href="#roadmap" className="text-body-sm">
                Roadmap
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="text-label footer-title">Resources</h4>
          <ul className="footer-links">
            <li>
              <a href="#blog" className="text-body-sm">
                Blog
              </a>
            </li>
            <li>
              <a href="#docs" className="text-body-sm">
                Documentation
              </a>
            </li>
            <li>
              <a href="#api" className="text-body-sm">
                API Reference
              </a>
            </li>
            <li>
              <a href="#community" className="text-body-sm">
                Community
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="text-label footer-title">Legal</h4>
          <ul className="footer-links">
            <li>
              <a href="#privacy" className="text-body-sm">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#terms" className="text-body-sm">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#cookies" className="text-body-sm">
                Cookie Policy
              </a>
            </li>
            <li>
              <a href="#contact" className="text-body-sm">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p className="text-caption">
            © {currentYear} Radiator Routes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
