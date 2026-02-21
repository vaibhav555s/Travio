import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import TripSetup from './pages/TripSetup'
import Crew from './pages/Crew'
import Processing from './pages/Processing'
import Plans from './pages/Plans'
import PlanDetail from './pages/PlanDetail'
import Dashboard from './pages/Dashboard'
import Navigation from './components/Navigation'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<TripSetup />} />
          <Route path="/crew" element={<Crew />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/:planId" element={<PlanDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login"  element={<LoginPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
