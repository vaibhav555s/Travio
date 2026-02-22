import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const API_BASE = '/api'

/* ─── Helpers ──────────────────────────────────────────────── */

/** Normalize AI activity shape → ActivityCard-compatible shape */
function normalizeActivity(act, idx) {
  return {
    time: act.time || `${(8 + idx * 2).toString().padStart(2, '0')}:00`,
    name: act.activity || act.name || 'Activity',
    location: act.location || '',
    cost: act.costEstimate || act.cost || '—',
    type: guessType(act.activity || act.name || ''),
    energy: guessEnergy(act.activity || act.name || ''),
  }
}

function guessType(name = '') {
  const n = name.toLowerCase()
  if (/hotel|check.in|resort|hostel|stay/.test(n)) return 'hotel'
  if (/beach|sea|coast|ocean|lake|river/.test(n)) return 'beach'
  if (/food|lunch|dinner|breakfast|cafe|restaurant|eat|meal/.test(n)) return 'food'
  if (/trek|hike|climb|bike|sport|adventure|kayak|rafting/.test(n)) return 'adventure'
  if (/temple|fort|museum|heritage|culture|church|history/.test(n)) return 'culture'
  if (/night|club|bar|pub|market/.test(n)) return 'nightlife'
  if (/bus|train|flight|drive|taxi|transfer|travel/.test(n)) return 'transport'
  return 'culture'
}

function guessEnergy(name = '') {
  const n = name.toLowerCase()
  if (/trek|hike|climb|sport|adventure|kayak|rafting/.test(n)) return 'High'
  if (/lunch|dinner|cafe|museum|temple|fort/.test(n)) return 'Medium'
  return 'Low'
}

function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a)
  return Math.max(1, Math.ceil(ms / 86400000) + 1)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  return diff
}

const TYPE_ICON = {
  hotel: '🏨', beach: '🏖️', food: '🍽️', adventure: '🧗',
  culture: '🏛️', nightlife: '🌙', transport: '✈️',
}
const TYPE_COLOR = {
  hotel: '#88a0b0', beach: '#82baa3', food: '#d68e72',
  adventure: '#b07f9c', culture: '#9785b8', nightlife: '#d8aa6b', transport: '#92a8d1',
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

/* ─── Component ────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()

  // ── Load from sessionStorage ──
  const [meta, setMeta] = useState(null)      // selectedPlanMeta
  const [itinerary, setItinerary] = useState(null) // selectedItinerary (AI plan)
  const [loading, setLoading] = useState(true)

  // ── UI state ──
  const [selectedDay, setSelectedDay] = useState(1)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [refineError, setRefineError] = useState('')
  const [refinedPlan, setRefinedPlan] = useState(null)
  const [collaborators, setCollaborators] = useState([])
  const [aiNote, setAiNote] = useState('')
  const promptRef = useRef(null)

  // ── Weather + Live Events ──
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [activeAlert, setActiveAlert] = useState(null)   // { type, title, icon, prompt }
  const [simulating, setSimulating] = useState(null)     // which event is being processed
  const [dismissedAlert, setDismissedAlert] = useState(false)

  const LIVE_EVENTS = [
    {
      id: 'rain',
      icon: '🌧️',
      label: 'Heavy Rain',
      color: '#3b82f6',
      alert: '⚠️ Heavy rain forecast at your destination',
      prompt: (dest, day) =>
        `It is raining heavily today in ${dest}. Day ${day} has outdoor activities. Please reschedule outdoor activities to indoor alternatives, keeping the same time slots and budget range.`,
    },
    {
      id: 'traffic',
      icon: '🚗',
      label: 'Traffic Jam',
      color: '#f59e0b',
      alert: '🚗 Major traffic congestion on route — 90 min delay',
      prompt: (dest, day) =>
        `There is a major traffic jam near ${dest} causing a 90-minute delay this morning. Please push all activities on Day ${day} forward by 90 minutes and adjust titles to reflect the delay.`,
    },
    {
      id: 'flight',
      icon: '✈️',
      label: 'Flight Delay',
      color: '#e8631a',
      alert: '✈️ Flight delayed by 3 hours — arrival pushed to evening',
      prompt: (dest, day) =>
        `The flight to ${dest} was delayed by 3 hours. Day ${day} arrival is now evening. Please remove morning activities on Day 1 and compress the remaining ones into afternoon/evening slots.`,
    },
  ]

  // ── Fetch data ──
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1. Read metadata
        const rawMeta = sessionStorage.getItem('selectedPlanMeta')
        const parsedMeta = rawMeta ? JSON.parse(rawMeta) : {}
        setMeta(parsedMeta)

        // 2. Try sessionStorage itinerary first (set by PlanDetail)
        const rawIt = sessionStorage.getItem('selectedItinerary')
        let plan = rawIt ? JSON.parse(rawIt) : null

        // 3. If not in sessionStorage, try API
        if (!plan && parsedMeta?.tripId) {
          const token = localStorage.getItem('accessToken')
          if (token) {
            const res = await fetch(
              `${API_BASE}/plans/trip/${parsedMeta.tripId}/selected`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            if (res.ok) plan = await res.json()
          }
        }

        if (plan) {
          setItinerary(plan)
          if (plan.aiNote) setAiNote(plan.aiNote)
        }

        // 4. Fetch live weather for destination
        if (parsedMeta?.destination) {
          setWeatherLoading(true)
          try {
            const wRes = await fetch(`/api/weather/${encodeURIComponent(parsedMeta.destination)}`)
            if (wRes.ok) {
              const wData = await wRes.json()
              setWeather(wData)
              // Auto-show alert banner for bad weather
              if ((wData.severity === 'moderate' || wData.severity === 'severe') && !wData.simulated) {
                setActiveAlert({
                  type: 'weather',
                  icon: wData.severity === 'severe' ? '⛈️' : '🌧️',
                  title: `${wData.severity === 'severe' ? 'Severe weather' : 'Rain'} detected in ${wData.city} — your plan may need adjustments`,
                  prompt: `Current weather in ${wData.city}: ${wData.condition}, ${wData.temp}°C. Some activities may be affected. Please adjust Day 1 to avoid outdoor activities that would be dangerous or uncomfortable in this weather.`,
                })
              }
            }
          } catch (e) { console.warn('[Weather] fetch failed:', e.message) }
          finally { setWeatherLoading(false) }
        }
        if (parsedMeta?.tripId) {
          const token = localStorage.getItem('accessToken')
          if (token) {
            const res = await fetch(
              `${API_BASE}/trips/${parsedMeta.tripId}/collaborators`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            if (res.ok) {
              const data = await res.json()
              setCollaborators(Array.isArray(data) ? data : [])
            }
          }
        }
      } catch (err) {
        console.error('[Dashboard] load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  // ── AI Refine ──
  const handleRefine = async () => {
    if (!refinePrompt.trim()) return
    setIsRefining(true)
    setRefineError('')
    const planToRefine = refinedPlan || itinerary
    try {
      const res = await fetch(`${API_BASE}/itinerary/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planToRefine, userRequest: refinePrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refine failed')
      setRefinedPlan(data.refinedPlan)
      if (data.refinedPlan?.aiNote) setAiNote(data.refinedPlan.aiNote)
      setRefinePrompt('')
      if (promptRef.current) promptRef.current.style.height = 'auto'
    } catch (err) {
      setRefineError(err.message)
    } finally {
      setIsRefining(false)
    }
  }

  // ── Simulate Live Event ──
  const handleSimulateEvent = async (event) => {
    const dest = meta?.destination || 'the destination'
    const day = selectedDay
    const prompt = event.prompt(dest, day)

    // Show the alert banner immediately
    setActiveAlert({ type: event.id, icon: event.icon, title: event.alert, prompt })
    setDismissedAlert(false)
    setSimulating(event.id)

    // Call AI refine with the event-specific prompt
    const planToRefine = refinedPlan || itinerary
    try {
      const res = await fetch(`${API_BASE}/itinerary/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planToRefine, userRequest: prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Simulation failed')
      setRefinedPlan(data.refinedPlan)
      if (data.refinedPlan?.aiNote) setAiNote(data.refinedPlan.aiNote)
    } catch (err) {
      console.error('[Simulate] error:', err.message)
    } finally {
      setSimulating(null)
    }
  }


  // ── Derived ──
  const plan = refinedPlan || itinerary
  const days = plan?.dailyPlan || plan?.days || []
  const totalDays = days.length || (meta ? daysBetween(meta.departureDate, meta.returnDate) : 0)
  const currentDayData = days.find(d => d.day === selectedDay) || days[selectedDay - 1]
  const activities = (currentDayData?.activities || []).map(normalizeActivity)

  const accent = meta?.accent || '#E8631A'
  const countdown = meta?.departureDate ? daysUntil(meta.departureDate) : null
  const statusLabel = countdown === null ? '' :
    countdown > 0 ? `${countdown} day${countdown !== 1 ? 's' : ''} to go` :
      countdown === 0 ? '🔴 Departing today!' :
        `🔴 Day ${Math.abs(countdown) + 1} – Live`

  const budgetNum = Number(meta?.budget || 0)
  const totalCostStr = meta?.totalCost || plan?.estimatedTotalBudget || ''
  const estimatedNum = parseInt((totalCostStr || '').replace(/[^0-9]/g, '')) || 0
  const budgetPct = budgetNum && estimatedNum ? Math.min(100, Math.round((estimatedNum / budgetNum) * 100)) : 0

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="tcd-loading">
        <div className="tcd-loading-spinner" />
        <p>Loading your trip…</p>
      </div>
    )
  }

  /* ── No data ── */
  if (!plan && !meta?.destination) {
    return (
      <div className="tcd-empty">
        <span>🗺️</span>
        <h2>No trip selected yet</h2>
        <p>Select a route from your plan to see your trip command center.</p>
        <button onClick={() => navigate('/plans')}>← Back to Plans</button>
      </div>
    )
  }

  return (
    <motion.div
      className="tcd-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════ */}
      <div
        className="tcd-hero"
        style={{ backgroundImage: `url(${meta?.photo || ''})` }}
      >
        <div className="tcd-hero-overlay" />
        <div className="tcd-hero-inner">
          <button className="tcd-back-btn" onClick={() => navigate('/home')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            My Trips
          </button>

          <div className="tcd-hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <p className="tcd-hero-plan-name">{meta?.title || 'Your Trip'}</p>
              <h1 className="tcd-hero-dest">📍 {meta?.destination}</h1>
              <div className="tcd-hero-pills">
                {meta?.departureDate && (
                  <span className="tcd-hero-pill">
                    📅 {formatDate(meta.departureDate)} → {formatDate(meta.returnDate)}
                  </span>
                )}
                {meta?.travelers && (
                  <span className="tcd-hero-pill">👥 {meta.travelers} traveler{meta.travelers > 1 ? 's' : ''}</span>
                )}
                {totalCostStr && (
                  <span className="tcd-hero-pill">💰 {totalCostStr}</span>
                )}
              </div>
            </motion.div>

            {statusLabel && (
              <motion.div
                className="tcd-status-badge"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
              >
                {statusLabel}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          WEATHER STRIP
      ════════════════════════════════════ */}
      {weather && (
        <div className="tcd-weather-strip">
          <div className="tcd-weather-inner">
            <img
              className="tcd-weather-icon"
              src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.condition}
            />
            <span className="tcd-weather-temp">{weather.temp}°C</span>
            <span className="tcd-weather-cond">{weather.condition}</span>
            {weather.humidity && (
              <span className="tcd-weather-meta">💧 {weather.humidity}%</span>
            )}
            {weather.windSpeed && (
              <span className="tcd-weather-meta">💨 {weather.windSpeed} km/h</span>
            )}
            {weather.simulated && (
              <span className="tcd-weather-sim-badge">Simulated</span>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          LIVE ALERT BANNER
      ════════════════════════════════════ */}
      <AnimatePresence>
        {activeAlert && !dismissedAlert && (
          <motion.div
            className={`tcd-alert-banner tcd-alert-${activeAlert.type}`}
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="tcd-alert-inner">
              <span className="tcd-alert-icon">{activeAlert.icon}</span>
              <div className="tcd-alert-content">
                <p className="tcd-alert-title">{activeAlert.title}</p>
                <p className="tcd-alert-sub">
                  {simulating
                    ? '⚡ AI is adapting your itinerary in real-time…'
                    : refinedPlan
                      ? '✅ Itinerary has been updated. Scroll down to see changes.'
                      : 'Tap a simulation button to auto-adapt your plan.'}
                </p>
              </div>
              <button
                className="tcd-alert-dismiss"
                onClick={() => setDismissedAlert(true)}
              >✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
          MAIN TWO-COLUMN LAYOUT
      ════════════════════════════════════ */}
      <div className="tcd-body">

        {/* ══ LEFT — Day viewer ══════════════ */}
        <div className="tcd-left">

          {/* Day tabs */}
          <div className="tcd-day-tabs">
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <button
                key={d}
                className={`tcd-day-tab ${selectedDay === d ? 'active' : ''}`}
                onClick={() => setSelectedDay(d)}
                style={selectedDay === d ? { '--tab-accent': accent } : {}}
              >
                <span className="tcd-tab-label">DAY</span>
                <span className="tcd-tab-num">{d}</span>
              </button>
            ))}
          </div>

          {/* Day title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              className="tcd-day-header"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="tcd-day-title">
                Day {selectedDay}
                {currentDayData?.title ? ` — ${currentDayData.title}` : ''}
              </h2>
              {activities.length > 0 && (
                <p className="tcd-day-count">{activities.length} activities</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Activities */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`activities-${selectedDay}`}
              className="tcd-activities"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {activities.length === 0 ? (
                <div className="tcd-no-activities">No activities planned for this day.</div>
              ) : (
                activities.map((act, idx) => (
                  <motion.div key={idx} className="tcd-act-row" variants={fadeUp}>
                    {/* Time column */}
                    <div className="tcd-act-time">
                      <span className="tcd-act-hr">{act.time.split(':')[0]}</span>
                      <span className="tcd-act-colon">:</span>
                      <span className="tcd-act-min">{act.time.split(':')[1]}</span>
                    </div>

                    {/* Connector */}
                    <div className="tcd-act-connector">
                      <div
                        className="tcd-act-dot"
                        style={{ background: TYPE_COLOR[act.type] || '#aaa' }}
                      />
                      {idx < activities.length - 1 && <div className="tcd-act-line" />}
                    </div>

                    {/* Card */}
                    <div
                      className="tcd-act-card"
                      style={{ '--act-accent': TYPE_COLOR[act.type] || '#aaa' }}
                    >
                      <div className="tcd-act-top">
                        <span className="tcd-act-icon">{TYPE_ICON[act.type] || '📌'}</span>
                        <div className="tcd-act-info">
                          <h3 className="tcd-act-name">{act.name}</h3>
                          {act.location && (
                            <p className="tcd-act-location">📍 {act.location}</p>
                          )}
                        </div>
                      </div>
                      <div className="tcd-act-bottom">
                        <span
                          className="tcd-act-type"
                          style={{ color: TYPE_COLOR[act.type] }}
                        >
                          {act.type.charAt(0).toUpperCase() + act.type.slice(1)}
                        </span>
                        <span className="tcd-act-energy">{act.energy} energy</span>
                        <span className="tcd-act-cost">{act.cost}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ══ RIGHT — Control panel ══════════ */}
        <div className="tcd-right">

          {/* Budget Card */}
          <motion.div
            className="tcd-panel"
            variants={fadeUp} initial="hidden" animate="show"
          >
            <p className="tcd-panel-title">💰 Budget</p>
            <div className="tcd-budget-row">
              <div>
                <p className="tcd-budget-label">Your budget</p>
                <p className="tcd-budget-val">₹{budgetNum.toLocaleString()}</p>
              </div>
              {totalCostStr && (
                <div style={{ textAlign: 'right' }}>
                  <p className="tcd-budget-label">Trip estimate</p>
                  <p className="tcd-budget-val">{totalCostStr}</p>
                </div>
              )}
            </div>
            {budgetPct > 0 && (
              <div className="tcd-budget-bar-wrap">
                <div className="tcd-budget-bar">
                  <motion.div
                    className="tcd-budget-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    style={{
                      background: budgetPct > 90
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : `linear-gradient(90deg, ${accent}, #F59E0B)`
                    }}
                  />
                </div>
                <span className="tcd-budget-pct">{budgetPct}% of budget</span>
              </div>
            )}
          </motion.div>

          {/* AI Refine Panel */}
          <motion.div
            className="tcd-panel tcd-ai-panel"
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.08 }}
          >
            <p className="tcd-panel-title">🤖 Ask AI to Adjust</p>
            <p className="tcd-ai-hint">
              Try: <em>"Make Day 2 more budget-friendly"</em> or <em>"Add a morning yoga on Day 1"</em>
            </p>

            {aiNote && (
              <motion.div
                className="tcd-ai-note"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                ✦ {aiNote}
              </motion.div>
            )}

            <textarea
              ref={promptRef}
              className="tcd-ai-input"
              placeholder="Describe what to change…"
              value={refinePrompt}
              onChange={e => {
                setRefinePrompt(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${e.target.scrollHeight}px`
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleRefine()
                }
              }}
              rows={2}
            />

            {refineError && (
              <p className="tcd-ai-error">⚠️ {refineError}</p>
            )}

            <button
              className="tcd-ai-btn"
              onClick={handleRefine}
              disabled={isRefining || !refinePrompt.trim()}
              style={{ '--btn-accent': accent }}
            >
              {isRefining
                ? <><span className="tcd-spinner" /> Refining…</>
                : '✦ Apply Changes'}
            </button>

            {refinedPlan && (
              <p className="tcd-ai-refined-badge">✓ AI refined version active</p>
            )}
          </motion.div>

          {/* Live Events / Simulations */}
          <motion.div
            className="tcd-panel"
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.12 }}
          >
            <p className="tcd-panel-title">📡 Live Events (Demo)</p>
            <div className="tcd-events-list">
              {LIVE_EVENTS.map(ev => (
                <button
                  key={ev.id}
                  className="tcd-event-btn"
                  onClick={() => handleSimulateEvent(ev)}
                  disabled={simulating !== null}
                  style={{ '--ev-color': ev.color }}
                >
                  <span className="tcd-ev-icon">{ev.icon}</span>
                  <div className="tcd-ev-info">
                    <span className="tcd-ev-label">{ev.label}</span>
                    <span className="tcd-ev-sub">Simulate event</span>
                  </div>
                  {simulating === ev.id ? (
                    <span className="tcd-spinner tcd-ev-spin" />
                  ) : (
                    <span className="tcd-ev-arrow">→</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>


          {/* Trip Summary */}
          <motion.div
            className="tcd-panel"
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.15 }}
          >
            <p className="tcd-panel-title">📋 Trip Summary</p>
            <div className="tcd-summary-grid">
              <div className="tcd-summary-item">
                <span className="tcd-sum-label">Total Days</span>
                <span className="tcd-sum-val">{totalDays}</span>
              </div>
              <div className="tcd-summary-item">
                <span className="tcd-sum-label">Travelers</span>
                <span className="tcd-sum-val">{meta?.travelers || '—'}</span>
              </div>
              <div className="tcd-summary-item">
                <span className="tcd-sum-label">Departure</span>
                <span className="tcd-sum-val">{formatDate(meta?.departureDate) || '—'}</span>
              </div>
              <div className="tcd-summary-item">
                <span className="tcd-sum-label">Return</span>
                <span className="tcd-sum-val">{formatDate(meta?.returnDate) || '—'}</span>
              </div>
            </div>
          </motion.div>

          {/* Crew Panel */}
          <motion.div
            className="tcd-panel"
            variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: 0.22 }}
          >
            <p className="tcd-panel-title">👥 Crew</p>
            {collaborators.length === 0 ? (
              <p className="tcd-crew-empty">
                Just you, solo traveler 🎒
                <br />
                <button className="tcd-invite-link" onClick={() => navigate('/plans')}>
                  Invite collaborators →
                </button>
              </p>
            ) : (
              <div className="tcd-crew-list">
                {collaborators.map((c, i) => (
                  <div key={i} className="tcd-crew-member">
                    <div className="tcd-crew-avatar">
                      {(c.name || c.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="tcd-crew-name">{c.name || c.email}</p>
                      <p className={`tcd-crew-status ${c.status}`}>{c.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </motion.div>
  )
}
