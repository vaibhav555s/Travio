import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import './DestinationCards.css'

const DESTINATIONS = [
  {
    name: 'Pacific Coast Highway',
    location: 'California, USA',
    description: 'Iconic cliff-side drives with sweeping ocean views and sea-breeze villages.',
    days: '5 days',
    tag: 'Coastal',
    category: 'coastal',
    featured: true,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&h=700&fit=crop',
  },
  {
    name: 'Blue Ridge Parkway',
    location: 'North Carolina, USA',
    description: 'Panoramic mountain ridgelines with autumn foliage.',
    days: '7 days',
    tag: 'Mountain',
    category: 'mountain',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop',
  },
  {
    name: 'Manali – Leh Highway',
    location: 'Himachal Pradesh, India',
    description: 'High-altitude passes, prayer flags, and breathtaking moonscapes.',
    days: '8 days',
    tag: 'Mountain',
    category: 'mountain',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&h=400&fit=crop',
  },
  {
    name: 'Route 66 Adventure',
    location: 'Illinois to California',
    description: 'The Mother Road — retro diners, ghost towns, and open skies.',
    days: '10 days',
    tag: 'Desert',
    category: 'desert',
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=400&fit=crop',
  },
  {
    name: 'Milford Sound',
    location: 'New Zealand',
    description: 'Fjords, waterfalls, and dramatic South Island landscapes.',
    days: '6 days',
    tag: 'Coastal',
    category: 'coastal',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=400&fit=crop',
  },
  {
    name: 'Great Ocean Road',
    location: 'Victoria, Australia',
    description: 'Coastal wonders, limestone apostles, and wild surf breaks.',
    days: '4 days',
    tag: 'Coastal',
    category: 'coastal',
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500&h=400&fit=crop',
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

                  <Link to="/setup" className="dest-card-btn">
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
