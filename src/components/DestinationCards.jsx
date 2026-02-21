import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from './SVGIcons'
import './DestinationCards.css'

const DestinationCards = () => {
  const destinations = [
    {
      name: 'Pacific Coast Highway',
      location: 'California',
      description: 'Iconic cliff-side drives with ocean views',
      days: '5 days',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=600&fit=crop',
    },
    {
      name: 'Blue Ridge Parkway',
      location: 'North Carolina',
      description: 'Scenic mountain routes with panoramic vistas',
      days: '7 days',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=600&fit=crop',
    },
    {
      name: 'Route 66 Adventure',
      location: 'Illinois to California',
      description: 'The Mother Road with retro charm and culture',
      days: '10 days',
      image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=600&fit=crop',
    },
    {
      name: 'Milford Sound Scenic',
      location: 'New Zealand',
      description: 'Fjords, waterfalls, and dramatic landscapes',
      days: '6 days',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=600&fit=crop',
    },
    {
      name: 'Alpine Loop',
      location: 'Switzerland',
      description: 'Mountain passes with Swiss village charm',
      days: '8 days',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop',
    },
    {
      name: 'Great Ocean Road',
      location: 'Australia',
      description: 'Coastal wonders and limestone cliffs',
      days: '4 days',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=600&fit=crop',
    },
  ]

  const [hoveredIdx, setHoveredIdx] = useState(null)

  return (
    <section className="destinations-section section-padding">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-display">Explore Popular Routes</h2>
          <p className="text-lead">
            Curated driving routes for every adventure level.
          </p>
        </motion.div>

        <div className="cards-scroll-container">
          <div className="cards-scroll">
            {destinations.map((dest, idx) => (
              <motion.div
                key={idx}
                className="destination-card"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onHoverStart={() => setHoveredIdx(idx)}
                onHoverEnd={() => setHoveredIdx(null)}
              >
                <div className="card-image">
                  <img src={dest.image} alt={dest.name} />
                  <div className="card-overlay">
                    <button className="card-btn">
                      <span>Explore Route</span>
                      <ArrowRightIcon size={20} />
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <span className="card-location text-label">
                    {dest.location}
                  </span>
                  <h3 className="text-title">{dest.name}</h3>
                  <p className="text-body-sm">{dest.description}</p>
                  <div className="card-meta">
                    <span className="text-label">{dest.days}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DestinationCards
