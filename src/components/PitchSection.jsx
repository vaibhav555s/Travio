import { motion } from 'framer-motion'
import { CheckmarkIcon } from './SVGIcons'
import './PitchSection.css'

const PitchSection = () => {
  const features = [
    {
      title: 'AI-Powered Planning',
      description: 'Let our intelligent algorithm discover the perfect route based on your preferences, budget, and time.',
      items: ['Smart routing', 'Real-time updates', 'Weather alerts'],
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=500&fit=crop',
    },
    {
      title: 'Discover Hidden Gems',
      description: 'Explore scenic viewpoints, local restaurants, and attractions off the beaten path.',
      items: ['Local insights', 'Photo spots', 'Insider tips'],
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=500&fit=crop',
    },
    {
      title: 'Travel with Friends',
      description: 'Collaborate with friends on your trip planning and share experiences in real-time.',
      items: ['Group planning', 'Live updates', 'Shared memories'],
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=600&h=500&fit=crop',
    },
  ]

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="pitch-section section-padding">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-display">Why Choose Radiator Routes?</h2>
          <p className="text-lead">
            Everything you need for the perfect road trip experience.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <div className="feature-image">
                <img src={feature.image} alt={feature.title} />
              </div>

              <div className="feature-content">
                <h3 className="text-title">{feature.title}</h3>
                <p className="text-body-sm">{feature.description}</p>

                <ul className="feature-list">
                  {feature.items.map((item, i) => (
                    <li key={i}>
                      <CheckmarkIcon size={18} color="var(--color-accent)" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PitchSection
