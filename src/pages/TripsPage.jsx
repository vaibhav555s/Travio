import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TripCard from '../components/TripCard'
import './PagesShared.css'

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const myTrips = [
    { id: '1', destination: 'Goa', dates: 'Mar 1 – Mar 6', budget: '32,000', badge: 'owner' },
    { id: '2', destination: 'Rishikesh', dates: 'May 3 – May 7', budget: '18,000', badge: 'owner' },
]
const teamTrips = [
    { id: '3', destination: 'Manali', dates: 'Apr 12 – Apr 18', budget: '28,000', badge: 'team', teamName: 'Weekend Warriors' },
    { id: '4', destination: 'Coorg', dates: 'Jun 5 – Jun 8', budget: '15,000', badge: 'team', teamName: 'Road Runners' },
]

export default function TripsPage() {
    const navigate = useNavigate()
    return (
        <motion.div className="trips-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div className="trips-container">

                <motion.div className="trips-page-header" variants={fadeUp} initial="hidden" animate="show">
                    <p className="trips-page-eyebrow">Radiator Routes</p>
                    <h1 className="trips-page-title">My Trips</h1>
                    <p className="trips-page-subtitle">Plan, edit and collaborate on your journeys.</p>
                    <div className="page-header-divider" />
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
                    <p className="trips-section-title">Created By You</p>
                    {myTrips.length > 0 ? (
                        <motion.div className="trips-grid" variants={stagger} initial="hidden" animate="show">
                            {myTrips.map(trip => (
                                <motion.div key={trip.id} variants={fadeUp}>
                                    <TripCard destination={trip.destination} dates={trip.dates} budget={trip.budget} badge="owner"
                                        onOpen={() => navigate('/plans')} onEdit={() => navigate('/setup')} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : <div className="trips-empty">No trips created yet.</div>}
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.18 }}>
                    <p className="trips-section-title">Team Trips</p>
                    {teamTrips.length > 0 ? (
                        <motion.div className="trips-grid" variants={stagger} initial="hidden" animate="show">
                            {teamTrips.map(trip => (
                                <motion.div key={trip.id} variants={fadeUp}>
                                    <TripCard destination={trip.destination} dates={trip.dates} budget={trip.budget} badge="team"
                                        teamName={trip.teamName} onOpen={() => navigate('/plans')} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : <div className="trips-empty">No team trips yet.</div>}
                </motion.div>

            </div>
        </motion.div>
    )
}
