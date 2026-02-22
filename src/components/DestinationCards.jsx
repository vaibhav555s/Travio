import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import './DestinationCards.css'

const DESTINATIONS = [
  {
    name: 'Manali – Leh Highway',
    location: 'Himachal Pradesh, India',
    description: 'The ultimate bucket-list drive through high-altitude passes and moon-like landscapes.',
    days: '8 days',
    tag: 'Mountain',
    category: 'mountain',
    featured: true,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=900&h=700&fit=crop',
  },
  {
    name: 'The Golden Triangle',
    location: 'Delhi – Agra – Jaipur',
    description: 'Explore the heart of India’s history, from the Taj Mahal to the Pink City.',
    days: '6 days',
    tag: 'Desert',
    category: 'desert',
    image: '/golden-triangle-tour-banner.jpg',
  },
  {
    name: 'Konkan Coastal Drive',
    location: 'Mumbai – Goa',
    description: 'Breathtaking ocean views, hidden forts, and the freshest seafood along the coast.',
    days: '5 days',
    tag: 'Coastal',
    category: 'coastal',
    image: 'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?w=500&h=400&fit=crop',
  },
  {
    name: 'The Desert Circuit',
    location: 'Jodhpur – Jaisalmer',
    description: 'Drive through the golden sands of the Thar Desert and sleep under the stars.',
    days: '4 days',
    tag: 'Desert',
    category: 'desert',
    image: '/Jodhpur – Jaisalmer.webp',
  },
  {
    name: 'Munnar Tea Trails',
    location: 'Idukki, Kerala',
    description: 'Winding roads through lush tea estates, misty valleys, and cascading waterfalls.',
    days: '4 days',
    tag: 'Mountain',
    category: 'mountain',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=500&h=400&fit=crop',
  },
  {
    name: 'East Coast Road',
    location: 'Chennai – Pondicherry',
    description: 'A beautiful seaside cruise along the ECR to the colonial French town.',
    days: '3 days',
    tag: 'Coastal',
    category: 'coastal',
    image: '/Chennai – Pondicherry.jpg',
  },
]

const FILTERS = ['All', 'Coastal', 'Mountain', 'Desert']

const DestinationCards = () => {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? DESTINATIONS
    : DESTINATIONS.filter(d => d.tag === activeFilter)

  return (
    <section id="explore" className="destinations-section">
      <div className="container">

        {/* ── Section header ── */}
        <motion.div
          className="destinations-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="dest-eyebrow">✦ DESTINATIONS</p>
          <h2 className="dest-title">Explore Popular Routes</h2>
          <p className="dest-subtitle">Handpicked routes for every kind of traveller.</p>
        </motion.div>

        {/* ── Filter pills ── */}
        <motion.div
          className="dest-filters"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {FILTERS.map(f => (
            <button
              key={f}
              className={`dest-filter-pill ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
              {activeFilter === f && (
                <motion.div className="dest-filter-bg" layoutId="filter-bg" />
              )}
            </button>
          ))}
        </motion.div>

        {/* ── Bento grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            className="dest-bento"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {filtered.map((dest, idx) => (
              <motion.div
                key={dest.name}
                className={`dest-card ${dest.featured ? 'dest-card--featured' : ''}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.07 }}
                whileHover="hover"
              >
                {/* Image */}
                <div className="dest-card-img-wrap">
                  <motion.img
                    src={dest.image}
                    alt={dest.name}
                    className="dest-card-img"
                    variants={{ hover: { scale: 1.08, transition: { duration: 0.55 } } }}
                  />
                  <div className="dest-card-gradient" />

                  {/* Tag pill */}
                  <div className={`dest-tag dest-tag--${dest.category}`}>{dest.tag}</div>

                  {/* Duration */}
                  <div className="dest-duration">📅 {dest.days}</div>
                </div>

                {/* Content */}
                <div className="dest-card-body">
                  <p className="dest-card-location">📍 {dest.location}</p>
                  <h3 className="dest-card-name">{dest.name}</h3>
                  <p className="dest-card-desc">{dest.description}</p>

                  <Link to="/setup" state={{ destination: dest.name }} className="dest-card-btn">
                    Plan this route
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}

export default DestinationCards
