export const mockProperties = [
  {
    id: 1,
    name: 'Sunset Gardens',
    address: '123 Main St',
    region: 'Peoria',
    branch: 'Phoenix',
    account_manager: 'John Smith',
    property_type: 'Commercial',
    company: 'Green Valley HOA',
    timer_type: 'Rain Bird ESP-ME',
    days_since_irrigation_invoice: 15,
    days_since_irrigation_visit: 8,
    gate_code: '1234',
    zones: [
      { 
        id: 1, 
        name: 'Front Lawn', 
        type: 'turf', 
        duration: 20, 
        frequency: 'custom-days',
        days: ['Mon', 'Wed', 'Fri'], 
        last_adjusted_by: 'John Smith', 
        last_adjusted_at: '2025-01-15',
        history: [
          { changed_by: 'John Smith', changed_at: '01/15/2025', changes: { duration: { from: 15, to: 20 }, days: { from: ['Mon', 'Tue', 'Thu', 'Sat'], to: ['Mon', 'Wed', 'Fri'] } }, note: 'Dry weather adjustment' }
        ]
      },
      { 
        id: 2, 
        name: 'Side Garden', 
        type: 'shrubs', 
        duration: 15, 
        frequency: 'every-other-day',
        days: null, 
        last_adjusted_by: 'Jane Doe', 
        last_adjusted_at: '2025-01-14',
        history: []
      }
    ],
    notes: 'New drought-resistant plants installed in side garden.'
  },
  {
    id: 2,
    name: 'Green Valley HOA',
    address: '456 Oak Ave',
    region: 'Peoria',
    branch: 'Phoenix',
    account_manager: 'Jane Doe',
    property_type: 'HOA',
    company: 'Green Valley HOA',
    timer_type: 'Hunter Pro-C',
    days_since_irrigation_invoice: 45,
    days_since_irrigation_visit: 22,
    gate_code: '5678#',
    zones: [
      { 
        id: 4, 
        name: 'Common Area', 
        type: 'turf', 
        duration: 25, 
        frequency: 'daily',
        days: null, 
        last_adjusted_by: 'Mike Johnson', 
        last_adjusted_at: '2025-01-16',
        history: []
      }
    ],
    notes: 'Reduce watering during rainy season.'
  }
];