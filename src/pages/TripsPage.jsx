import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Luggage, Search, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { deleteTrip, listTrips } from '../api/tripsApi'

function formatDate(value) {
  if (!value) return null
  // Parse the date-only string as local calendar values rather than
  // `new Date(value)`, which treats "YYYY-MM-DD" as UTC midnight and can
  // render a day early in timezones behind UTC.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm shadow-slate-900/[0.03]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30">
        <Icon size={26} />
      </div>
      <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  )
}

export default function TripsPage() {
  const { user, token } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    listTrips(token)
      .then((data) => {
        if (!cancelled) setTrips(data)
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
  }, [user, token])

  async function handleRemove(tripId) {
    setRemovingId(tripId)
    setError(null)
    try {
      await deleteTrip(token, tripId)
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId))
    } catch (err) {
      setError(err.message)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">My Trips</h1>
      <p className="mt-2 text-slate-500">Flights you&apos;ve saved from search results show up here.</p>

      {!user && (
        <EmptyState icon={Luggage} title="Sign in to see your trips">
          <p className="max-w-sm text-sm text-slate-500">
            Create an account or sign in to save flights and pick up where you left off.
          </p>
          <div className="mt-2 flex items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
            >
              Sign in
            </Link>
            <Link to="/register" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </div>
        </EmptyState>
      )}

      {user && loading && (
        <div className="mt-10 flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading your trips…
        </div>
      )}

      {user && !loading && (
        <>
          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {trips.length === 0 ? (
            <EmptyState icon={Luggage} title="No trips yet">
              <p className="max-w-sm text-sm text-slate-500">
                Search for flights and tap the bookmark icon on any option to save it here.
              </p>
              <Link
                to="/search"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
              >
                <Search size={16} />
                Search flights
              </Link>
            </EmptyState>
          ) : (
            <div className="mt-8 flex flex-col gap-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-900/[0.03]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-base font-semibold text-slate-900">
                        {trip.airline}
                      </span>
                      <span className="text-sm font-semibold text-brand-600">
                        ${trip.price_usd}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {trip.origin} → {trip.destination}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      Depart {formatDate(trip.depart_date) ?? '—'}
                      {trip.arrival_date && ` · Arrive ${formatDate(trip.arrival_date)}`}
                      {typeof trip.stops === 'number' &&
                        ` · ${trip.stops === 0 ? 'Nonstop' : `${trip.stops} stop(s)`}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(trip.id)}
                    disabled={removingId === trip.id}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                    aria-label={`Remove ${trip.airline} trip`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
