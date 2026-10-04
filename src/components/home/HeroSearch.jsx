import { useState } from 'react'
import { PlaneTakeoff, MapPin, CalendarRange, Users, Wallet, Search, Loader2 } from 'lucide-react'
import AirportSelect from './AirportSelect'

function cityOnly(value) {
  return value.replace(/\s*\([A-Z]{3}\)\s*$/, '').trim()
}

const TRIP_TYPES = [
  { value: 'round-trip', label: 'Round trip' },
  { value: 'one-way', label: 'One way' },
  { value: 'multi-city', label: 'Multi-city' },
]

export default function HeroSearch({ onSearch, loading }) {
  const [tripType, setTripType] = useState('round-trip')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travelers, setTravelers] = useState(1)
  const [budget, setBudget] = useState('')

  const isMultiCity = tripType === 'multi-city'
  const isOneWay = tripType === 'one-way'

  const originCity = cityOnly(origin)
  const destinationCity = cityOnly(destination)
  const sameCity =
    !!originCity && !!destinationCity && originCity.toLowerCase() === destinationCity.toLowerCase()

  function handleSubmit(e) {
    e.preventDefault()
    if (!destination.trim() || !budget || loading || sameCity || isMultiCity) return

    const parts = [
      originCity
        ? `I want to travel from ${originCity} to ${destinationCity}`
        : `I want to travel to ${destinationCity}`,
    ]
    if (departDate) parts.push(`departing ${departDate}`)
    if (!isOneWay && returnDate) parts.push(`returning ${returnDate}`)
    if (Number(travelers) > 1) parts.push(`for ${travelers} travelers`)
    parts.push(`within a budget of $${budget}`)

    onSearch(parts.join(' '))
  }

  return (
    <div className="w-full">
      <fieldset className="mb-3 flex flex-wrap items-center gap-2 border-0 p-0">
        <legend className="sr-only">Trip type</legend>
        {TRIP_TYPES.map((type) => (
          <label
            key={type.value}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              tripType === type.value
                ? 'border-transparent bg-white text-brand-700 shadow-sm'
                : 'border-white/70 text-slate-600 hover:bg-white/60'
            }`}
          >
            <input
              type="radio"
              name="trip-type"
              value={type.value}
              checked={tripType === type.value}
              onChange={() => setTripType(type.value)}
              disabled={loading}
              className="sr-only"
            />
            {type.label}
          </label>
        ))}
      </fieldset>

      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-1 gap-2 rounded-3xl border border-white/60 bg-white/90 p-3 shadow-xl shadow-slate-900/10 backdrop-blur sm:grid-cols-2 sm:p-2.5 lg:grid-cols-12 lg:items-stretch lg:gap-1"
      >
        <div className="lg:col-span-2">
          <AirportSelect
            icon={PlaneTakeoff}
            iconClassName="text-brand-500"
            label="From (optional)"
            placeholder="Your city"
            value={origin}
            onChange={setOrigin}
            disabled={loading}
          />
        </div>

        <div className="lg:col-span-2">
          <AirportSelect
            icon={MapPin}
            iconClassName="text-accent-500"
            label="Destination"
            placeholder="Where to?"
            value={destination}
            onChange={setDestination}
            disabled={loading}
            required
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-50 sm:col-span-2 lg:col-span-3">
          <CalendarRange size={18} className="shrink-0 text-brand-500" />
          <div className="flex w-full flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {isOneWay ? 'Departure' : 'Dates'}
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                disabled={loading}
                aria-label="Departure date"
                className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
              />
              {!isOneWay && (
                <>
                  <span className="shrink-0 text-slate-300">–</span>
                  <input
                    type="date"
                    value={returnDate}
                    min={departDate || undefined}
                    onChange={(e) => setReturnDate(e.target.value)}
                    disabled={loading}
                    aria-label="Return date (optional)"
                    className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                  />
                </>
              )}
            </div>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-50 lg:col-span-1">
          <Users size={18} className="shrink-0 text-accent-500" />
          <div className="flex w-full flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Travelers
            </span>
            <input
              type="number"
              min="1"
              max="9"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
            />
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-50 lg:col-span-2">
          <Wallet size={18} className="shrink-0 text-brand-500" />
          <div className="flex w-full flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Budget (USD)
            </span>
            <input
              type="number"
              min="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 500"
              required
              disabled={loading}
              className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading || !destination.trim() || !budget || sameCity || isMultiCity}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-xl hover:shadow-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer sm:col-span-2 lg:col-span-2"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <Search size={17} />
              Search
            </>
          )}
        </button>
      </form>

      {sameCity && (
        <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Destination must be different from the departure city.
        </div>
      )}

      {isMultiCity && (
        <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          Multi-city search isn&apos;t available yet — try Round trip or One way for now.
        </div>
      )}
    </div>
  )
}
