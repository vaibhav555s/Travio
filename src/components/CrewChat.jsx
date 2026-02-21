import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockMessages, crewMembers } from '../data/mockMessages'
import './CrewChat.css'

export default function CrewChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage = {
        sender: 'You',
        color: '#6B9E4A',
        initials: 'ME',
        text: inputValue,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        own: true,
        isAI: false,
      }
      setMessages([...messages, newMessage])
      setInputValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="crew-chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }}
          />

          {/* Chat Panel */}
          <motion.div
            className="crew-chat-drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="drawer-handle-area">
              <div className="drawer-handle" />
            </div>

            {/* Header */}
            <div className="chat-header">
              <div>
                <h3 className="chat-title">Crew Chat</h3>
                <div className="crew-avatars-row">
                  {crewMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="crew-avatar-small"
                      style={{ '--avatar-color': member.color }}
                      title={member.name}
                    >
                      {member.initials}
                    </div>
                  ))}
                  <span className="crew-status">4 members · 2 active now</span>
                </div>
              </div>
              <button className="chat-close" onClick={onClose}>
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              <AnimatePresence>
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className={`message ${message.own ? 'own' : ''} ${message.isAI ? 'ai' : ''}`}
                  >
                    {!message.own && !message.isAI && (
                      <div className="message-avatar" style={{ background: message.color }}>
                        {message.initials}
                      </div>
                    )}

                    <div className="message-content">
                      {!message.own && !message.isAI && (
                        <div className="message-sender">{message.sender}</div>
                      )}

                      {message.isAI && (
                        <div className="message-ai-header">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="2" fill="#E8A21A" />
                            <circle cx="4" cy="4" r="1.5" fill="#E8A21A" />
                            <circle cx="12" cy="4" r="1.5" fill="#E8A21A" />
                            <circle cx="4" cy="12" r="1.5" fill="#E8A21A" />
                            <circle cx="12" cy="12" r="1.5" fill="#E8A21A" />
                          </svg>
                          <span>Radiator AI</span>
                          <span className="message-time">{message.time}</span>
                        </div>
                      )}

                      <div className="message-bubble">{message.text}</div>

                      {!message.isAI && (
                        <div className="message-time">{message.time}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <motion.button
                className="chat-send"
                onClick={handleSend}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 1L14 8L1 15V9.5L9 8L1 6.5V1Z" fill="white" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
