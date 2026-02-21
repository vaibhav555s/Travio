import { generateItinerary } from './services/geminiService.js'

const mockTripData = {
    destination: 'Jaipur',
    departureDate: '2025-03-10',
    returnDate: '2025-03-15',
    budget: '55000',
    travelers: 2,
    vibes: ['Cultural', 'Historical']
}

async function test() {
    console.log('Testing generateItinerary...')
    try {
        const result = await generateItinerary('recommended', mockTripData)
        console.log('--- SUCCESS ---')
        console.log('Keys returned:', Object.keys(result))
        if (result.dailyPlan) console.log('Days in dailyPlan:', result.dailyPlan.length)
        if (result.days) console.log('Days in days:', result.days.length)
        console.log('Trip Summary:', result.tripSummary)
        console.log('Full JSON:')
        console.log(JSON.stringify(result, null, 2))
    } catch (err) {
        console.error('--- FAILED ---')
        console.error('Error Message:', err.message)
        if (err.stack) console.error('Stack:', err.stack)
    }
}

test()
