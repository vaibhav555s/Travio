import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuthPage from './AuthPage'
import { ArrowRightIcon } from '../components/SVGIcons'
import axios from 'axios'
import './AuthPage.css'

const SignupPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        formData,
        { withCredentials: true }
      )
      localStorage.setItem('accessToken', data.accessToken) // or store in memory
      navigate('/setup')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
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
      title="Create your account"
      subtitle="Start planning your perfect road trip today."
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in"
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
          { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
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
          <span>{loading ? 'Creating account...' : 'Get Started'}</span>
          {!loading && <ArrowRightIcon size={20} />}
        </motion.button>
      </form>
    </AuthPage>
  )
}

export default SignupPage