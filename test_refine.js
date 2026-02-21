const fs = require('fs');

async function test() {
    try {
        const r = await fetch('http://localhost:5000/api/itinerary/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plan: {
                    tagline: 'Test trip',
                    totalCost: 'Rs.30,000',
                    days: [{ day: 1, title: 'Day 1', activities: [{ time: '09:00', activity: 'Walk', costEstimate: 'Rs.0' }] }]
                },
                userRequest: 'Make it more adventurous'
            })
        });
        const data = await r.json();
        fs.writeFileSync('./refine_output_utf8.json', JSON.stringify(data.refinedPlan.days, null, 2), 'utf8');
    } catch (e) { console.error(e) }
}
test();
