import 'dotenv/config';
import { refineItinerary } from './server/services/geminiService.js';
import fs from 'fs';

const mockPlan = {
    "tagline": "Discover the vibrant culture and history of Rajasthan.",
    "totalCost": "Rs.28,000",
    "days": [
        {
            "day": 1,
            "title": "Mumbai to Jaipur",
            "activities": [
                { "time": "08:00", "activity": "Explore Amber Fort", "location": "Amer", "costEstimate": "Rs.500" },
                { "time": "11:00", "activity": "Visit City Palace", "location": "Tripolia Bazar", "costEstimate": "Rs.300" },
                { "time": "14:00", "activity": "Discover Jantar Mantar", "location": "Tripolia Bazar", "costEstimate": "Rs.200" },
                { "time": "17:00", "activity": "Sunset at Nahargarh Fort", "location": "Brahampuri", "costEstimate": "Rs.200" }
            ]
        }
    ]
};

async function test() {
    console.log('Testing...');
    try {
        const result = await refineItinerary(mockPlan, 'Make it more budget-friendly');
        fs.writeFileSync('./raw_ai_refine_output_2.json', JSON.stringify(result, null, 2), 'utf8');
        console.log('Done!');
    } catch (err) {
        console.error(err);
    }
}
test();
