import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TeamCard from '../components/TeamCard'
import CreateTeamModal from '../components/CreateTeamModal'
import './PagesShared.css'

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

const DEFAULT_TEAMS = [
    { id: '1', name: 'Weekend Warriors', memberCount: 4, tripCount: 2 },
    { id: '2', name: 'Road Runners', memberCount: 2, tripCount: 1 },
]

export default function TeamsPage() {
    const [teams, setTeams] = useState([])
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('teams') || 'null')
        setTeams(saved || DEFAULT_TEAMS)
    }, [])

    const handleCreate = (newTeam) => setTeams(prev => [...prev, newTeam])

    return (
        <motion.div className="teams-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div className="teams-container">

                <div className="teams-page-topbar">
                    <motion.div className="teams-page-header" variants={fadeUp} initial="hidden" animate="show">
                        <p className="teams-page-eyebrow">Radiator Routes</p>
                        <h1 className="teams-page-title">Teams</h1>
                        <p className="teams-page-subtitle">Collaborate and plan together.</p>
                        <div className="page-header-divider" />
                    </motion.div>
                    <motion.button
                        className="create-team-btn"
                        onClick={() => setShowModal(true)}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.35 }}
                    >
                        + Create Team
                    </motion.button>
                </div>

                {teams.length > 0 ? (
                    <motion.div className="teams-grid" variants={stagger} initial="hidden" animate="show">
                        {teams.map(team => (
                            <motion.div key={team.id} variants={fadeUp}>
                                <TeamCard id={team.id} name={team.name} memberCount={team.memberCount} tripCount={team.tripCount} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="teams-empty">
                        <span style={{ fontSize: '2rem' }}>🤝</span>
                        <p>No teams yet. Create one to start planning together!</p>
                    </div>
                )}
            </div>

            <CreateTeamModal isOpen={showModal} onClose={() => setShowModal(false)} onCreate={handleCreate} />
        </motion.div>
    )
}
