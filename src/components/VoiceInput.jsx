import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './VoiceUI.css'

/* ── Mic SVG ── */
const MicIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="11" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
)

/* ── Submit arrow ── */
const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

/* ════════════════════════════════════════
   VoiceInput — self-contained voice UI
   ════════════════════════════════════════ */
const VoiceInput = () => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [text, setText] = useState('')
    const [showTip, setShowTip] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [audioChunks, setAudioChunks] = useState([])
    const inputRef = useRef(null)
    const tipTimer = useRef(null)

    /* ── Recording Logic ── */
    const startRecording = async () => {
        try {
            console.log("🎙 Requesting microphone access...")
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)

            recorder.onstart = () => {
                console.log("🎤 Recording started")
                setAudioChunks([])
            }

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    console.log("📦 Audio chunk received")
                    setAudioChunks((prev) => [...prev, event.data])
                }
            }

            recorder.onstop = async () => {
                console.log("⏹ Recording stopped")
                // Use the ref or current state to get chunks
                // Note: setAudioChunks is async, but onstop happens after all dataavailable
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsListening(true)
        } catch (error) {
            console.error("❌ Mic error:", error)
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop()
            setIsListening(false)

            // Process chunks after a tiny delay to ensure all data is collected
            setTimeout(async () => {
                // We need the most recent chunks. Since we're in a closure, 
                // we might need a ref for chunks or use the callback pattern.
                // However, the user provided a simple version. Let's refine for reliability.
            }, 100)
        }
    }

    // Effect to handle the actual sending when recording stops and chunks are ready
    useEffect(() => {
        if (!isListening && audioChunks.length > 0 && mediaRecorder) {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
            console.log("📁 Blob created:", audioBlob)
            sendAudioToServer(audioBlob)
            setAudioChunks([]) // clear for next time
        }
    }, [isListening, audioChunks.length, mediaRecorder])

    const sendAudioToServer = async (blob) => {
        console.log("🚀 Sending audio to backend...")
        try {
            const formData = new FormData()
            formData.append("audio", blob)

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/speech-to-text`, {
                method: "POST",
                body: formData,
            })

            const data = await response.json()
            console.log("📝 Transcription received:", data)

            if (data.text) {
                setText(data.text)
            }
        } catch (error) {
            console.error("❌ Send error:", error)
        }
    }

    /* Focus input + show tip when bar opens */
    useEffect(() => {
        if (isExpanded) {
            const t = setTimeout(() => inputRef.current?.focus(), 80)
            setShowTip(true)
            tipTimer.current = setTimeout(() => setShowTip(false), 3000)
            return () => { clearTimeout(t); clearTimeout(tipTimer.current) }
        } else {
            setShowTip(false)
        }
    }, [isExpanded])

    /* ── Open expanded bar ── */
    const handleFabClick = () => setIsExpanded(true)

    /* ── Mic toggle inside bar ── */
    const handleMicToggle = () => {
        setShowTip(false)
        clearTimeout(tipTimer.current)
        if (isListening) {
            stopRecording()
            setTimeout(() => inputRef.current?.focus(), 60)
        } else {
            startRecording()
        }
    }

    /* ── Cancel logic ── */
    const handleCancel = () => {
        if (text.length > 0) {
            // Has text → clear text only, stay open
            setText('')
            setIsListening(false)
            setTimeout(() => inputRef.current?.focus(), 60)
        } else {
            // Empty → close bar, mic reappears
            setIsListening(false)
            setIsExpanded(false)
        }
    }

    /* ── Submit ── */
    const handleSubmit = () => {
        if (!text.trim()) return
        console.log('[VoiceInput] Trip query:', text)
        // TODO: wire to trip generation
    }

    /* ── Enter key submits ── */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && text.trim()) handleSubmit()
        if (e.key === 'Escape') handleCancel()
    }

    return (
        <>
            {/* ══ STATE 1: Idle FAB ══ */}
            <AnimatePresence>
                {!isExpanded && (
                    <motion.button
                        className="vi-fab"
                        onClick={handleFabClick}
                        aria-label="Open voice assistant"
                        title="Voice assistant"
                        key="vi-fab"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                        <MicIcon size={22} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ══ STATE 2 & 3: Expanded bar + optional scrim ══ */}
            <AnimatePresence>
                {isExpanded && (
                    <>
                        {/* Scrim — 5% dim, click to close if empty */}
                        <motion.div
                            key="vi-scrim"
                            className="vi-scrim"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            onClick={() => text.length === 0 && (setIsExpanded(false), setIsListening(false))}
                        />

                        {/* Center input bar */}
                        <motion.div
                            key="vi-bar"
                            className="vi-bar-wrap"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <div className="vi-bar">

                                {/* Mic button (left) — with "Tap to speak" tooltip */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <button
                                        className={`vi-mic${isListening ? ' listening' : ''}`}
                                        onClick={handleMicToggle}
                                        aria-label={isListening ? 'Stop listening' : 'Start speaking'}
                                        title={isListening ? 'Stop listening' : 'Tap to speak'}
                                    >
                                        <MicIcon size={19} />
                                    </button>

                                    {/* Tap to speak callout */}
                                    <AnimatePresence>
                                        {showTip && !isListening && (
                                            <motion.div
                                                className="vi-tip"
                                                initial={{ opacity: 0, y: 6, x: '-50%', scale: 0.92 }}
                                                animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                                                exit={{ opacity: 0, y: 4, x: '-50%', scale: 0.92 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                Tap to speak
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Road-line divider */}
                                <div className="vi-divider" aria-hidden="true" />

                                {/* Text input */}
                                <input
                                    ref={inputRef}
                                    className={`vi-input${isListening ? ' frozen' : ''}`}
                                    type="text"
                                    placeholder={isListening ? 'Listening…' : 'Describe your trip…'}
                                    value={text}
                                    onChange={e => !isListening && setText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    readOnly={isListening}
                                    autoComplete="off"
                                    aria-label="Trip description"
                                />

                                {/* Cancel (always visible in expanded mode) */}
                                <button
                                    className="vi-cancel"
                                    onClick={handleCancel}
                                    aria-label={text.length > 0 ? 'Clear text' : 'Close'}
                                    title={text.length > 0 ? 'Clear' : 'Close'}
                                >
                                    ✕
                                </button>

                                {/* Submit — only when text exists */}
                                <AnimatePresence>
                                    {text.trim() && (
                                        <motion.button
                                            key="vi-submit"
                                            className="vi-submit"
                                            onClick={handleSubmit}
                                            aria-label="Submit"
                                            initial={{ opacity: 0, scale: 0.7 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.7 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <ArrowIcon />
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default VoiceInput
