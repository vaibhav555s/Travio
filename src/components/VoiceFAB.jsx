import { useState, useRef } from 'react'
import './VoiceUI.css'

const MicIcon = ({ size = 22 }) => (
    <svg
        width={size} height={size}
        viewBox="0 0 24 24" fill="none"
        className="voice-fab-icon"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
    >
        <rect x="9" y="2" width="6" height="11" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
)

const VoiceFAB = () => {
    const [expanded, setExpanded] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [text, setText] = useState('')
    const inputRef = useRef(null)

    // ── State: Collapsed → click FAB → Expanded (typing)
    const handleFabClick = () => {
        if (!expanded) {
            setExpanded(true)
            // Focus input on next frame
            setTimeout(() => inputRef.current?.focus(), 50)
            return
        }
        // Already expanded: toggle listening
        if (isListening) {
            // Stop listening → back to typing
            setIsListening(false)
            setTimeout(() => inputRef.current?.focus(), 50)
        } else {
            // Start listening → freeze input
            setIsListening(true)
        }
    }

    // ── Cancel: stop listening, restore editable
    const handleCancel = () => {
        setIsListening(false)
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    return (
        <div className="voice-float" role="region" aria-label="Voice assistant">

            {/* ── Pill (visible in typing + listening states) ── */}
            {expanded && (
                <div className={`voice-pill ${isListening ? 'listening' : ''}`}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={`voice-pill-input ${isListening ? 'listening' : ''}`}
                        placeholder={isListening ? 'Listening…' : 'Describe your trip or speak…'}
                        value={text}
                        onChange={e => !isListening && setText(e.target.value)}
                        readOnly={isListening}
                        aria-label="Trip description input"
                    />

                    {/* Cancel button — only in listening mode */}
                    {isListening && (
                        <button
                            className="voice-cancel-btn"
                            onClick={handleCancel}
                            aria-label="Stop listening"
                        >
                            ✕
                        </button>
                    )}
                </div>
            )}

            {/* ── Mic FAB ── */}
            <button
                className={`voice-fab ${isListening ? 'listening' : ''}`}
                onClick={handleFabClick}
                aria-label={
                    !expanded ? 'Open voice assistant'
                        : isListening ? 'Stop listening'
                            : 'Start speaking'
                }
                title={
                    !expanded ? 'Voice assistant'
                        : isListening ? 'Stop listening'
                            : 'Start speaking'
                }
            >
                <MicIcon />
            </button>

        </div>
    )
}

export default VoiceFAB
