import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CollaboratorModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500'

const statusColors = {
    accepted: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', label: 'Joined' },
    pending: { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', label: 'Pending' },
}

function Avatar({ name, size = 36 }) {
    const initials = name
        ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?'
    // Deterministic hue from name
    const hue = name
        ? Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
        : 200
    return (
        <div
            className="cm-avatar"
            style={{
                width: size, height: size,
                background: `hsl(${hue}, 60%, 52%)`,
                fontSize: size * 0.36,
            }}
        >
            {initials}
        </div>
    )
}

export default function CollaboratorModal({ isOpen, onClose, tripId, isOwner }) {
    const [email, setEmail] = useState('')
    const [collaborators, setCollabs] = useState([])
    const [loading, setLoading] = useState(false)
    const [inviting, setInviting] = useState(false)
    const [removing, setRemoving] = useState(null)   // userId being removed
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const token = localStorage.getItem('accessToken')
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    // ── Fetch collaborators whenever modal opens ──────────────
    useEffect(() => {
        if (!isOpen || !tripId) return
        const load = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${API_URL}/api/trips/${tripId}/collaborators`, { headers })
                if (res.ok) setCollabs(await res.json())
            } catch { /* silent */ }
            finally { setLoading(false) }
        }
        load()
    }, [isOpen, tripId])

    // ── Invite ────────────────────────────────────────────────
    const handleInvite = async () => {
        if (!email.trim()) return
        setInviting(true); setError(''); setSuccessMsg('')
        try {
            const res = await fetch(`${API_URL}/api/trips/${tripId}/invite`, {
                method: 'POST', headers,
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.message || 'Something went wrong'); return }
            setCollabs(prev => [...prev, data.collaborator])
            setEmail('')
            setSuccessMsg('Invite sent!')
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setInviting(false)
        }
    }

    // ── Remove ────────────────────────────────────────────────
    const handleRemove = async (userId) => {
        setRemoving(userId); setError('')
        try {
            const res = await fetch(`${API_URL}/api/trips/${tripId}/collaborators/${userId}`, {
                method: 'DELETE', headers,
            })
            if (!res.ok) { const d = await res.json(); setError(d.message); return }
            setCollabs(prev => prev.filter(c => c.userId !== userId && c.userId?._id !== userId))
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setRemoving(null)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="cm-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="cm-panel"
                        initial={{ opacity: 0, scale: 0.94, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 24 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Header */}
                        <div className="cm-header">
                            <div className="cm-header-left">
                                <div className="cm-icon-wrap">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="cm-title">Trip Crew</h2>
                                    <p className="cm-subtitle">Invite people to view & edit this itinerary</p>
                                </div>
                            </div>
                            <button className="cm-close-btn" onClick={onClose} aria-label="Close">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Invite row — only visible to owner */}
                        {isOwner && (
                            <div className="cm-invite-row">
                                <div className="cm-input-wrap">
                                    <svg className="cm-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <input
                                        className="cm-email-input"
                                        type="email"
                                        placeholder="Enter their email address…"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError('') }}
                                        onKeyDown={e => e.key === 'Enter' && handleInvite()}
                                        disabled={inviting}
                                    />
                                </div>
                                <motion.button
                                    className={`cm-invite-btn ${inviting ? 'loading' : ''}`}
                                    onClick={handleInvite}
                                    disabled={inviting || !email.trim()}
                                    whileHover={!inviting && email.trim() ? { scale: 1.02 } : {}}
                                    whileTap={!inviting && email.trim() ? { scale: 0.98 } : {}}
                                >
                                    {inviting ? <span className="cm-spinner" /> : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                            Invite
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        )}

                        {/* Feedback */}
                        <AnimatePresence>
                            {(error || successMsg) && (
                                <motion.div
                                    className={`cm-feedback ${error ? 'error' : 'success'}`}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                >
                                    {error || successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Collaborator List */}
                        <div className="cm-list-section">
                            <span className="cm-list-label">
                                {collaborators.length === 0 ? 'NO CREW YET' : `CREW · ${collaborators.length}`}
                            </span>

                            {loading ? (
                                <div className="cm-loading">
                                    {[1, 2].map(i => <div key={i} className="cm-skeleton" />)}
                                </div>
                            ) : collaborators.length === 0 ? (
                                <div className="cm-empty">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                                    </svg>
                                    <p>No one invited yet. Invite your crew above!</p>
                                </div>
                            ) : (
                                <div className="cm-list">
                                    <AnimatePresence>
                                        {collaborators.map((c, idx) => {
                                            const style = statusColors[c.status] || statusColors.pending
                                            const cId = c.userId?._id || c.userId || c._id
                                            return (
                                                <motion.div
                                                    key={cId || idx}
                                                    className="cm-collab-row"
                                                    initial={{ opacity: 0, x: -12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 12, transition: { duration: 0.2 } }}
                                                    transition={{ duration: 0.28, delay: idx * 0.05 }}
                                                >
                                                    <Avatar name={c.name || c.email} />
                                                    <div className="cm-collab-info">
                                                        <span className="cm-collab-name">{c.name || 'Invited User'}</span>
                                                        <span className="cm-collab-email">{c.email}</span>
                                                    </div>
                                                    <div className="cm-collab-right">
                                                        <span
                                                            className="cm-status-pill"
                                                            style={{ background: style.bg, color: style.text }}
                                                        >
                                                            {style.label}
                                                        </span>
                                                        {isOwner && (
                                                            <motion.button
                                                                className="cm-remove-btn"
                                                                onClick={() => handleRemove(cId)}
                                                                disabled={removing === cId}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                title="Remove from trip"
                                                            >
                                                                {removing === cId ? (
                                                                    <span className="cm-spinner cm-spinner-sm" />
                                                                ) : (
                                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                                    </svg>
                                                                )}
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
