export const mockPlans = [
  {
    id: 'golden',
    name: 'The Golden Route',
    tagline: 'Balanced and beautiful',
    badge: 'RECOMMENDED',
    photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    accent: '#E8631A',
    metrics: { budget: 65, energy: 58, experience: 91, regretRisk: 5 },
    totalCost: '₹32,000',
    nights: 5,
    highlights: ['Beach morning walk', 'Old Goa heritage tour', 'Local seafood dinner', 'Sunset cruise'],
    aiNote: "Best match for your crew's mixed energy levels. Priya's budget sensitivity respected.",
    days: [
      {
        day: 1,
        title: 'Arrival & Settle',
        activities: [
          { time: '14:00', name: 'Hotel check-in', type: 'hotel', energy: 'Low', cost: 'Included' },
          { time: '17:00', name: 'Calangute beach walk', type: 'beach', energy: 'Low', cost: '₹0' },
          { time: '20:00', name: 'Dinner at Ritz Classic', type: 'food', energy: 'Low', cost: '₹900' },
        ],
      },
      {
        day: 2,
        title: 'Culture & Coast',
        activities: [
          { time: '09:00', name: 'Old Goa churches', type: 'culture', energy: 'Medium', cost: '₹200' },
          { time: '13:00', name: "Fisherman's Wharf lunch", type: 'food', energy: 'Low', cost: '₹700' },
          { time: '17:00', name: 'Sunset at Anjuna', type: 'beach', energy: 'Low', cost: '₹0' },
          { time: '21:00', name: 'Night market stroll', type: 'nightlife', energy: 'Medium', cost: '₹500' },
        ],
      },
    ],
  },
  {
    id: 'wild',
    name: 'The Wild Card',
    tagline: 'Maximum experiences',
    badge: 'HIGH ENERGY',
    photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    accent: '#C44A6B',
    metrics: { budget: 88, energy: 94, experience: 97, regretRisk: 16 },
    totalCost: '₹43,000',
    nights: 5,
    highlights: ['Dudhsagar falls trek', 'Water sports day', "Club night at Tito's", 'Sunrise hike'],
    aiNote: 'High energy demand. May be challenging for lower-energy travelers by day 3.',
    days: [
      {
        day: 1,
        title: 'Arrive & Dive In',
        activities: [
          { time: '13:00', name: 'Check-in & quick rest', type: 'hotel', energy: 'Low', cost: 'Included' },
          { time: '16:00', name: 'Water sports at Baga', type: 'adventure', energy: 'High', cost: '₹2,500' },
          { time: '21:00', name: "Tito's Club night", type: 'nightlife', energy: 'High', cost: '₹1,500' },
        ],
      },
    ],
  },
  {
    id: 'offbeat',
    name: 'The Offbeat Path',
    tagline: 'Slow travel, hidden gems',
    badge: 'BUDGET FRIENDLY',
    photo: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80',
    accent: '#4A9E6B',
    metrics: { budget: 42, energy: 40, experience: 83, regretRisk: 8 },
    totalCost: '₹21,000',
    nights: 5,
    highlights: ['Village homestay', 'Local cooking class', 'Chapora fort walk', 'Stargazing night'],
    aiNote: "Budget-conscious and low-intensity. Reflects Vikram's preference for authentic local experiences.",
    days: [
      {
        day: 1,
        title: 'Arrive Slow',
        activities: [
          { time: '14:00', name: 'Village homestay check-in', type: 'hotel', energy: 'Low', cost: '₹1,200' },
          { time: '17:00', name: 'Evening market walk', type: 'culture', energy: 'Low', cost: '₹0' },
          { time: '20:00', name: 'Home-cooked dinner', type: 'food', energy: 'Low', cost: '₹400' },
        ],
      },
    ],
  },
]

export const mockCrewData = {
  travelers: [
    { id: 1, name: 'Priya', energyLevel: 2, budgetType: 'Budget', interests: ['Food', 'History', 'Wellness'] },
    { id: 2, name: 'Vikram', energyLevel: 3, budgetType: 'Moderate', interests: ['Nature', 'Adventure', 'History'] },
  ],
  destination: 'Goa',
  duration: 5,
}
