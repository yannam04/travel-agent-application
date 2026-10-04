async function handleResponse(response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.')
  }
  return data
}

export async function listTrips(token) {
  const response = await fetch('/api/trips', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return handleResponse(response)
}

export async function saveTrip(token, flight) {
  const response = await fetch('/api/trips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(flight),
  })
  return handleResponse(response)
}

export async function deleteTrip(token, tripId) {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return handleResponse(response)
}
