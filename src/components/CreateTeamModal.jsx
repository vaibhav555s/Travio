import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CreateTeamModal.css'

const CreateTeamModal = ({ isOpen, onClose, onCreate }) => {
    const [teamName, setTeamName] = useState('')

    const handleCreate = () => {
        if (!teamName.trim()) return
        const newTeam = {
            id: Date.now().toString(),
            name: teamName.trim(),
            memberCount: 1,
            tripCount: 0,
            members: ['You (Owner)'],
        }
        // Persist to localStorage
        const existing = JSON.parse(localStorage.getItem('teams') || '[]')
        localStorage.setItem('teams', JSON.stringify([...existing, newTeam]))
        if (onCreate) onCreate(newTeam)
        setTeamName('')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-box"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="modal-title">Create a Team</h2>
                        <p className="modal-subtitle">Invite your crew and plan trips together.</p>

                        <div className="modal-field">
                            <label className="modal-label">Team Name</label>
                            <input
                                className="modal-input"
                                placeholder="e.g., Weekend Warriors"
                                value={teamName}
                                onChange={e => setTeamName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
                            <button className="modal-btn primary" onClick={handleCreate}>Create Team</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default CreateTeamModal
