import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import TripCard from '../components/TripCard'
import './PagesShared.css'

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.25, 0.1, 0.25, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

const ALL_TEAMS = {
    '1': {
        name: 'Weekend Warriors',
        members: [
            { name: 'You', role: 'owner' },
            { name: 'Arjun Mehta', role: 'member' },
            { name: 'Priya Sharma', role: 'member' },
            { name: 'Vikram Rao', role: 'member' },
        ],
        trips: [
            { id: 't1', destination: 'Manali', dates: 'Apr 12 – Apr 18', budget: '28,000' },
            { id: 't2', destination: 'Coorg', dates: 'Jan 5 – Jan 8', budget: '14,000' },
        ],
    },
    '2': {
        name: 'Road Runners',
        members: [
            { name: 'You', role: 'owner' },
            { name: 'Sneha Joshi', role: 'member' },
        ],
        trips: [
            { id: 't3', destination: 'Pondicherry', dates: 'Feb 20 – Feb 23', budget: '12,000' },
        ],
    },
}

export default function TeamDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const savedTeams = JSON.parse(localStorage.getItem('teams') || '[]')
    const savedTeam = savedTeams.find(t => t.id === id)
    const team = ALL_TEAMS[id] || (savedTeam ? {
        name: savedTeam.name,
        members: [{ name: 'You', role: 'owner' }],
        trips: [],
    } : null)

    if (!team) {
        return (
            <div className="team-detail-page">
                <div className="team-detail-container">
                    <button className="team-detail-back" onClick={() => navigate('/teams')}>← Back to Teams</button>
                    <h1 className="team-detail-title">Team not found</h1>
                </div>
            </div>
        )
    }

    return (
        <motion.div className="team-detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div className="team-detail-container">

                <motion.div className="team-detail-header" variants={fadeUp} initial="hidden" animate="show">
                    <button className="team-detail-back" onClick={() => navigate('/teams')}>← Back to Teams</button>
                    <h1 className="team-detail-title">🛣️ {team.name}</h1>
                    <div className="page-header-divider" />
                </motion.div>

                {/* Members */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
                    <p className="td-section-title">Members</p>
                    <div className="td-section-divider" />
                    <motion.div className="td-members-list" variants={stagger} initial="hidden" animate="show">
                        {team.members.map((member, idx) => (
                            <motion.div key={idx} className="td-member-row" variants={fadeUp}>
                                <div className="td-member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                                <span className="td-member-name">{member.name}</span>
                                <span className={`td-member-role ${member.role}`}>
                                    {member.role === 'owner' ? 'Owner' : 'Member'}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Team Trips */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.18 }}>
                    <p className="td-section-title">Team Trips</p>
                    <div className="td-section-divider" />
                    {team.trips.length > 0 ? (
                        <motion.div className="td-trips-grid" variants={stagger} initial="hidden" animate="show">
                            {team.trips.map(trip => (
                                <motion.div key={trip.id} variants={fadeUp}>
                                    <TripCard destination={trip.destination} dates={trip.dates} budget={trip.budget}
                                        badge="team" onOpen={() => navigate('/plans')} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="teams-empty"><p>No trips planned yet.</p></div>
                    )}
                </motion.div>

            </div>
        </motion.div>
    )
}
