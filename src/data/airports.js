// A curated set of major airports in IATA-standard "City (CODE)" form,
// used to power the origin/destination pickers.
export const AIRPORTS = [
  { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy International Airport' },
  { code: 'ORD', city: 'Chicago', country: 'USA', name: "O'Hare International Airport" },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', name: 'Los Angeles International Airport' },
  { code: 'SFO', city: 'San Francisco', country: 'USA', name: 'San Francisco International Airport' },
  { code: 'MIA', city: 'Miami', country: 'USA', name: 'Miami International Airport' },
  { code: 'SEA', city: 'Seattle', country: 'USA', name: 'Seattle–Tacoma International Airport' },
  { code: 'BOS', city: 'Boston', country: 'USA', name: 'Logan International Airport' },
  { code: 'ATL', city: 'Atlanta', country: 'USA', name: 'Hartsfield–Jackson Atlanta International Airport' },
  { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson International Airport' },
  { code: 'LHR', city: 'London', country: 'UK', name: 'Heathrow Airport' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Schiphol Airport' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { code: 'MAD', city: 'Madrid', country: 'Spain', name: 'Adolfo Suárez Madrid–Barajas Airport' },
  { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci–Fiumicino Airport' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
  { code: 'DEL', city: 'New Delhi', country: 'India', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'BLR', city: 'Bengaluru', country: 'India', name: 'Kempegowda International Airport' },
  { code: 'HYD', city: 'Hyderabad', country: 'India', name: 'Rajiv Gandhi International Airport' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport' },
  { code: 'HKG', city: 'Hong Kong', country: 'China', name: 'Hong Kong International Airport' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Narita International Airport' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Incheon International Airport' },
  { code: 'DPS', city: 'Bali', country: 'Indonesia', name: 'Ngurah Rai International Airport' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith Airport' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', name: 'Melbourne Airport' },
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', name: 'São Paulo/Guarulhos International Airport' },
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', name: 'Mexico City International Airport' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', name: 'O. R. Tambo International Airport' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt', name: 'Cairo International Airport' },
]

export function searchAirports(query) {
  const q = query.trim().toLowerCase()
  if (!q) return AIRPORTS
  return AIRPORTS.filter(
    (a) =>
      a.city.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  )
}

export function formatAirport(airport) {
  return `${airport.city} (${airport.code})`
}
