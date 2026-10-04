import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { fetchFlightById } from '../api/travelApi'
import { saveTrip } from '../api/tripsApi'
import { useAuth } from '../context/AuthContext'

export default function FlightDetailsPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const [flight, setFlight] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchFlightById(id)
      .then((data) => {
        if (!cancelled) setFlight(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSave() {
    if (saved || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      await saveTrip(token, flight)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app">
      <h1>Flight Details</h1>
      {loading && <p>Loading…</p>}
      {error && <div className="results-banner error">{error}</div>}
      {flight && (
        <div className="flight-details">
          <div className="option-card-header">
            <span className="airline">{flight.airline}</span>
            <span className="price">${flight.price_usd}</span>
          </div>
          <dl>
            <dt>Route</dt>
            <dd>{flight.origin} → {flight.destination}</dd>
            <dt>Depart</dt>
            <dd>{flight.depart_date}</dd>
            <dt>Arrive</dt>
            <dd>{flight.arrival_date}</dd>
            <dt>Stops</dt>
            <dd>{flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop(s)`}</dd>
            <dt>Duration</dt>
            <dd>{flight.duration_hours}h</dd>
          </dl>

          {user ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || saved}
                className={`save-trip-button${saved ? ' saved' : ''}`}
              >
                {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {saved ? 'Saved to My Trips' : saving ? 'Saving…' : 'Save to My Trips'}
              </button>
              {saveError && <div className="results-banner error">{saveError}</div>}
            </>
          ) : (
            <p className="subtitle">
              <Link to="/login">Sign in</Link> to save this flight to My Trips.
            </p>
          )}
        </div>
      )}
      <Link to="/results">Back to results</Link>
    </div>
  )
}
