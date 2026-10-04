import { useId, useState } from 'react'
import { ArrowLeftRight, Loader2, MapPin, PlaneTakeoff, Search } from 'lucide-react'
import TextField from '../TextField'
import AirportSelect from '../home/AirportSelect'
import PassengerSelector from './PassengerSelector'

const TRIP_TYPES = [
  { value: 'round-trip', label: 'Round trip' },
  { value: 'one-way', label: 'One way' },
  { value: 'multi-city', label: 'Multi-city' },
]

function SelectField({ id, label, children, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export default function SearchForm({ onSearch, loading }) {
  const formId = useId()
  const [tripType, setTripType] = useState('round-trip')
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    depart_date: '',
    return_date: '',
    passengers: { adults: 1, children: 0, infants: 0, cabinClass: 'economy' },
    budget_usd: '',
    sort_by: 'recommended',
    stops_filter: '',
  })

  const isOneWay = tripType === 'one-way'
  const isMultiCity = tripType === 'multi-city'

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSwap() {
    setForm((prev) => ({ ...prev, origin: prev.destination, destination: prev.origin }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.origin.trim() || !form.destination.trim() || loading || isMultiCity) return
    onSearch({
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      depart_date: form.depart_date || null,
      return_date: !isOneWay && form.return_date ? form.return_date : null,
      travelers: form.passengers.adults,
      children: form.passengers.children,
      infants: form.passengers.infants,
      cabin_class: form.passengers.cabinClass,
      budget_usd: form.budget_usd === '' ? null : Number(form.budget_usd),
      sort_by: form.sort_by,
      stops_filter: form.stops_filter || null,
    })
  }

  return (
    <div>
      <fieldset className="mb-5 flex flex-wrap items-center gap-2 border-0 p-0">
        <legend className="sr-only">Trip type</legend>
        {TRIP_TYPES.map((type) => (
          <label
            key={type.value}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              tripType === type.value
                ? 'border-transparent bg-accent-500 text-white shadow-sm shadow-accent-500/30'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
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

      <form className="grid grid-cols-1 gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
          <div className="w-full">
            <AirportSelect
              icon={PlaneTakeoff}
              iconClassName="text-brand-500"
              label="From"
              placeholder="City, airport, or code"
              value={form.origin}
              onChange={(value) => update('origin', value)}
              disabled={loading}
              required
              labelClassName="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition hover:border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            disabled={loading}
            aria-label="Swap origin and destination"
            title="Swap origin and destination"
            className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeftRight size={16} />
          </button>

          <div className="w-full">
            <AirportSelect
              icon={MapPin}
              iconClassName="text-accent-500"
              label="To"
              placeholder="City, airport, or code"
              value={form.destination}
              onChange={(value) => update('destination', value)}
              disabled={loading}
              required
              labelClassName="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition hover:border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100"
            />
          </div>
        </div>
        <TextField
          id={`${formId}-date`}
          label="Departure date"
          type="date"
          value={form.depart_date}
          onChange={(e) => update('depart_date', e.target.value)}
        />
        {isOneWay ? (
          <PassengerSelector
            value={form.passengers}
            onChange={(next) => update('passengers', next)}
            disabled={loading}
          />
        ) : (
          <TextField
            id={`${formId}-return-date`}
            label="Return date"
            type="date"
            min={form.depart_date || undefined}
            value={form.return_date}
            onChange={(e) => update('return_date', e.target.value)}
          />
        )}
        {!isOneWay && (
          <PassengerSelector
            value={form.passengers}
            onChange={(next) => update('passengers', next)}
            disabled={loading}
          />
        )}
        <div>
          <TextField
            id={`${formId}-budget`}
            label="Maximum Budget ($)"
            type="number"
            min="0"
            value={form.budget_usd}
            onChange={(e) => update('budget_usd', e.target.value)}
            placeholder="No limit"
          />
          <p className="mt-1.5 text-xs text-slate-400">Maximum flight price per traveler</p>
        </div>
        <SelectField
          id={`${formId}-sort`}
          label="Sort by"
          value={form.sort_by}
          onChange={(e) => update('sort_by', e.target.value)}
        >
          <option value="recommended">Recommended</option>
          <option value="price">Cheapest</option>
          <option value="duration">Fastest</option>
          <option value="best">Best</option>
        </SelectField>
        <SelectField
          id={`${formId}-stops`}
          label="Stops"
          value={form.stops_filter}
          onChange={(e) => update('stops_filter', e.target.value)}
        >
          <option value="">Any</option>
          <option value="nonstop">Nonstop</option>
          <option value="one">1 stop</option>
          <option value="two_plus">2+ stops</option>
        </SelectField>

        <button
          type="submit"
          disabled={loading || isMultiCity}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none cursor-pointer sm:col-span-2 sm:mt-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          {loading ? 'Searching…' : 'Search Flights'}
        </button>
      </form>

      {isMultiCity && (
        <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          Multi-city search isn&apos;t available yet — try Round trip or One way for now.
        </div>
      )}
    </div>
  )
}
