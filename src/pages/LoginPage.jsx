import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuthPage from './AuthPage'
import { ArrowRightIcon } from '../components/SVGIcons'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './AuthPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData,
        { withCredentials: true }
      )
      localStorage.setItem('accessToken', data.accessToken)
      // JWT only contains user._id, so read name+email from the response body
      if (data.user) {
        localStorage.setItem('userName', data.user.name || '')
        localStorage.setItem('userEmail', data.user.email || '')
        setUser({ name: data.user.name || 'Traveler', email: data.user.email || '', id: data.user.id || '' })
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    })
  }

  return (
    <AuthPage
      title="Welcome back"
      subtitle="Continue your road trip adventure."
      switchText="Don't have an account?"
      switchLink="/signup"
      switchLabel="Sign up free"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <motion.div
            className="auth-error text-body-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {[
          { label: 'Email', name: 'email', type: 'email', placeholder: 'john@example.com' },
          { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
        ].map((field, i) => (
          <motion.div
            key={field.name}
            className="form-group"
            custom={i}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <label className="text-label">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </motion.div>
        ))}

        <motion.button
          type="submit"
          className="btn-primary auth-btn"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          {!loading && <ArrowRightIcon size={20} />}
        </motion.button>
      </form>
    </AuthPage>
  )
}

export default LoginPage