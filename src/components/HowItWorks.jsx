import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './HowItWorks.css'

const STEPS = [
    {
        num: '01',
        icon: '🗺️',
        title: 'Tell Us Your Dream',
        description: 'Enter your destination, dates, budget and travel style in under 60 seconds.',
    },
    {
        num: '02',
        icon: '🤖',
        title: 'AI Builds Your Plan',
        description: 'Our Gemini-powered engine designs a day-by-day itinerary tuned to your preferences.',
    },
    {
        num: '03',
        icon: '🤝',
        title: 'Invite Your Crew',
        description: 'Share the trip, invite collaborators, and plan together in real-time.',
    },
    {
        num: '04',
        icon: '✈️',
        title: 'Hit the Road',
        description: 'Download, share or open your itinerary on the go. Adventure awaits.',
    },
]

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="hiw-section">
            {/* Subtle top border */}
            <div className="hiw-top-border" />

            <div className="container">
                {/* Header */}
                <motion.div
                    className="hiw-header"
                    initial={{ opacity: 0, y: -16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="hiw-eyebrow">✦ HOW IT WORKS</p>
                    <h2 className="hiw-title">From Idea to Itinerary in Minutes</h2>
                    <p className="hiw-subtitle">Four simple steps to your perfect trip.</p>
                </motion.div>

                {/* Steps timeline */}
                <div className="hiw-steps">
                    {STEPS.map((step, idx) => (
                        <motion.div
                            key={step.num}
                            className="hiw-step"
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.55, delay: idx * 0.12 }}
                        >
                            {/* Connector line (not on last) */}
                            {idx < STEPS.length - 1 && <div className="hiw-connector" />}

                            {/* Number + Icon bubble */}
                            <div className="hiw-bubble">
                                <span className="hiw-bubble-num">{step.num}</span>
                                <span className="hiw-bubble-icon">{step.icon}</span>
                            </div>

                            {/* Text */}
                            <div className="hiw-step-text">
                                <h3 className="hiw-step-title">{step.title}</h3>
                                <p className="hiw-step-desc">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    className="hiw-cta"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Link to="/setup" className="hiw-cta-btn">
                        Start Planning For Free
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </Link>
                    <p className="hiw-cta-note">No credit card required · Free forever</p>
                </motion.div>
            </div>
        </section>
    )
}

export default HowItWorks
