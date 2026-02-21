import { useState } from 'react'
import './VoiceUI.css'

const MicSmallIcon = ({ color = 'currentColor' }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="11" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
)

const VoicePanel = ({ listening, onToggleListen, onClose }) => {
    const [text, setText] = useState('')
    // Simulate mic permission denied state — toggle via a hidden ctrl for demo
    const [denied, setDenied] = useState(false)

    const handleMicToggle = () => {
        if (denied) return
        onToggleListen()
    }

    return (
        <div className="voice-panel" role="dialog" aria-label="Voice assistant panel">
            {/* Drag handle */}
            <div className="voice-panel-handle" />

            {/* Title */}
            <p className="voice-panel-title">
                🎤 How can I plan your journey?
            </p>

            {/* Text input */}
            <textarea
                className="voice-panel-input"
                rows={2}
                placeholder="Describe your trip or speak…"
                value={text}
                onChange={e => setText(e.target.value)}
                spellCheck={false}
            />

            {/* Status row */}
            <div className="voice-panel-status">
                <span className={`voice-status-dot ${listening ? 'listening' : ''}`} />
                <span>
                    {listening
                        ? 'Listening…'
                        : denied
                            ? 'Microphone unavailable'
                            : 'Ready — tap the mic to speak'}
                </span>
            </div>

            {/* Permission denied warning */}
            {denied && (
                <div className="voice-panel-denied">
                    ⚠️ Microphone access denied. You can type instead.
                    {/* Hidden dev toggle — remove before prod */}
                    <button
                        onClick={() => setDenied(false)}
                        style={{
                            marginLeft: 'auto', fontSize: '0.7rem', background: 'none',
                            border: 'none', cursor: 'pointer', color: '#9ca3af'
                        }}
                    >reset</button>
                </div>
            )}

            {/* Actions */}
            <div className="voice-panel-actions">
                <button
                    className={`voice-mic-btn ${listening ? 'recording' : 'idle'}`}
                    onClick={handleMicToggle}
                    disabled={denied}
                >
                    <MicSmallIcon color="white" />
                    {listening ? 'Stop Listening' : 'Start Speaking'}
                </button>

                <button className="voice-close-btn" onClick={onClose} aria-label="Close panel">
                    ✕
                </button>
            </div>
        </div>
    )
}

export default VoicePanel
