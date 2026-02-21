import { motion } from 'framer-motion'
import './Toast.css'

export default function Toast({ message, icon, onDismiss, autoClose = true }) {
  // Auto close after 4 seconds
  if (autoClose) {
    setTimeout(onDismiss, 4000)
  }

  return (
    <motion.div
      className="toast"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {icon && <div className="toast-icon">{icon}</div>}
      <p className="toast-message">{message}</p>
      <button className="toast-dismiss" onClick={onDismiss}>
        ×
      </button>
    </motion.div>
  )
}
