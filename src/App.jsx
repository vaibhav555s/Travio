import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import TripSetup from './pages/TripSetup'
import Crew from './pages/Crew'
import Processing from './pages/Processing'
import Plans from './pages/Plans'
import PlanDetail from './pages/PlanDetail'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'
import TripsPage from './pages/TripsPage'
import TeamsPage from './pages/TeamsPage'
import TeamDetailPage from './pages/TeamDetailPage'
import Navigation from './components/Navigation'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import VoiceInput from './components/VoiceInput'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Navigation />
        <AnimatePresence mode="wait">
          <Routes>
            {/* ── Existing routes — untouched ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/setup" element={<TripSetup />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/plans/:planId" element={<PlanDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* ── New routes ── */}
            <Route path="/home" element={<UserDashboard />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
          </Routes>
        </AnimatePresence>
        {/* Floating Voice UI — fixed position, no layout impact */}
        <VoiceInput />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
