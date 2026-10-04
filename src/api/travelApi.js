export async function searchTravel(message) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  const data = await response.json()

  if (!response.ok && response.status !== 422) {
    throw new Error(data.error || 'Something went wrong while searching for travel options.')
  }

  return data
}

export async function searchFlights(filters) {
  const response = await fetch('/api/flights/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong while searching for flights.')
  }

  return data
}

export async function fetchFlightById(id) {
  const response = await fetch(`/api/flights/${encodeURIComponent(id)}`)

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Flight not found.')
  }

  return data
}
