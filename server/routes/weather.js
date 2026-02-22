import { Router } from 'express'

const router = Router()

const OWM_KEY = process.env.OPENWEATHER_API_KEY

/** Classify weather severity from OWM condition code */
function getSeverity(weatherId) {
    if (!weatherId) return 'clear'
    // Thunderstorm (2xx), Snow (6xx), Extreme (9xx)
    if (weatherId < 300 || weatherId >= 900) return 'severe'
    // Drizzle (3xx), Rain (5xx)
    if (weatherId < 400 || (weatherId >= 500 && weatherId < 600)) return 'moderate'
    // Atmosphere / fog (7xx)
    if (weatherId >= 700 && weatherId < 800) return 'moderate'
    return 'clear'
}

/**
 * GET /api/weather/:city
 * Returns current weather for the given city name.
 */
router.get('/:city', async (req, res) => {
    const { city } = req.params

    if (!OWM_KEY) {
        // No key configured — return a simulated clear weather response
        // so the frontend still renders. The simulation panel works without real weather.
        return res.json({
            city,
            temp: 28,
            condition: 'Clear sky',
            icon: '01d',
            humidity: 55,
            windSpeed: 12,
            severity: 'clear',
            simulated: true,
        })
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&units=metric&appid=${OWM_KEY}`
        const response = await fetch(url)

        if (!response.ok) {
            const err = await response.json()
            return res.status(response.status).json({ error: err.message || 'Weather fetch failed' })
        }

        const data = await response.json()
        const weather = data.weather?.[0] || {}

        return res.json({
            city: data.name || city,
            temp: Math.round(data.main?.temp ?? 28),
            feelsLike: Math.round(data.main?.feels_like ?? 28),
            condition: weather.description || 'Clear sky',
            icon: weather.icon || '01d',
            humidity: data.main?.humidity ?? 0,
            windSpeed: Math.round((data.wind?.speed ?? 0) * 3.6), // m/s → km/h
            severity: getSeverity(weather.id),
            weatherId: weather.id,
            simulated: false,
        })
    } catch (err) {
        console.error('[Weather] fetch error:', err.message)
        return res.status(500).json({ error: 'Failed to fetch weather data' })
    }
})

export default router
