import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchForm from '../components/search/SearchForm'
import { searchFlights } from '../api/travelApi'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80'

export default function SearchFlightsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imgFailed, setImgFailed] = useState(false)
  const navigate = useNavigate()

  async function handleSearch(filters) {
    setLoading(true)
    setError(null)
    try {
      const data = await searchFlights(filters)
      navigate('/results', { state: data })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-teal-900" />
      {!imgFailed && (
        <img
          src={HERO_IMAGE}
          alt="Commercial airplane on the tarmac"
          onError={() => setImgFailed(true)}
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/60 to-slate-900/80" />

      <div className="relative mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Search Flights
          </h1>
          <p className="mt-3 text-sm text-slate-200 sm:text-base">
            Filter by route, date, budget, and stops to find the fare that fits.
          </p>
        </div>

        <div className="mt-10 rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/20 sm:p-8">
          <SearchForm onSearch={handleSearch} loading={loading} />
          {error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
