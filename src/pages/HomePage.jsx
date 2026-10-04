import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ShieldCheck,
  Clock,
  TrendingDown,
  Globe2,
  Star,
  ArrowRight,
} from 'lucide-react'
import HeroSearch from '../components/home/HeroSearch'
import { searchTravel } from '../api/travelApi'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-matched itineraries',
    desc: 'Our agent reads your budget and destination in plain English and finds real, bookable flight options that fit.',
  },
  {
    icon: TrendingDown,
    title: 'Built around your budget',
    desc: 'Tell us the ceiling — we rank every option against it and flag anything that goes over before you commit.',
  },
  {
    icon: Clock,
    title: 'Results in seconds',
    desc: 'No endless filters or tabs. One search box, live fares, and a shortlist you can actually compare.',
  },
  {
    icon: ShieldCheck,
    title: 'Live, real fares',
    desc: 'Every option is pulled from live airline inventory — not stale caches or placeholder pricing.',
  },
]

const DESTINATIONS = [
  { city: 'Paris', country: 'France', from: 480, gradient: 'from-rose-400 to-orange-300' },
  { city: 'Tokyo', country: 'Japan', from: 690, gradient: 'from-sky-400 to-indigo-400' },
  { city: 'Bali', country: 'Indonesia', from: 520, gradient: 'from-emerald-400 to-teal-400' },
  { city: 'Dubai', country: 'UAE', from: 410, gradient: 'from-amber-400 to-orange-500' },
  { city: 'New York', country: 'USA', from: 260, gradient: 'from-violet-400 to-fuchsia-400' },
  { city: 'Chicago', country: 'USA', from: 230, gradient: 'from-cyan-400 to-blue-500' },
]

const STATS = [
  { value: '120+', label: 'Airlines connected' },
  { value: '35K+', label: 'Fares searched daily' },
  { value: '4.9/5', label: 'Traveler rating' },
]

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSearch(message) {
    setLoading(true)
    setError(null)
    try {
      const data = await searchTravel(message)
      navigate('/results', { state: data })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white font-sans text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-brand-400/30 to-accent-400/30 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-accent-400/20 to-brand-400/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pt-16 pb-20 text-center sm:px-8 sm:pt-24 sm:pb-28">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            <Sparkles size={14} />
            Powered by AI trip planning
          </span>

          <h1 className="max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Tell us where you want to go{' '}
            <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
              and your budget
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
            Our AI travel agent turns a single sentence into real, bookable flight
            options — matched to your destination and budget in seconds.
          </p>

          <div className="mt-10 w-full max-w-5xl">
            <HeroSearch onSearch={handleSearch} loading={loading} />
            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-slate-100 pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-slate-500 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Why travelers switch to us
          </h2>
          <p className="mt-3 text-slate-500">
            No spreadsheets, no juggling tabs — just tell the agent what you need.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/10"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30 transition group-hover:scale-110">
                <Icon size={20} />
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular destinations */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
                Popular right now
              </h2>
              <p className="mt-2 text-slate-500">Real fares our agent has surfaced this month.</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-amber-500">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              Loved by 12,000+ travelers
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.city}
                type="button"
                onClick={() =>
                  handleSearch(`I want to travel to ${dest.city} within a budget of $${dest.from}`)
                }
                className="group relative overflow-hidden rounded-2xl text-left shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 cursor-pointer"
              >
                <div
                  className={`flex h-36 items-center justify-center bg-gradient-to-br ${dest.gradient} text-white`}
                >
                  <Globe2 size={40} className="opacity-80 transition group-hover:scale-110" />
                </div>
                <div className="flex items-center justify-between bg-white p-5">
                  <div>
                    <div className="font-display text-lg font-semibold text-slate-900">
                      {dest.city}
                    </div>
                    <div className="text-sm text-slate-500">{dest.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">from</div>
                    <div className="font-display text-lg font-bold text-brand-600">
                      ${dest.from}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-accent-600 px-8 py-14 text-center shadow-xl shadow-brand-500/20 sm:px-16">
          <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to find your next trip?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-brand-50">
            Type your destination and budget above, and let the AI agent do the rest.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 shadow-lg transition hover:shadow-xl cursor-pointer"
          >
            Start planning
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 text-sm text-slate-400 sm:flex-row sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} AI Travel Agent. All fares shown are illustrative.</span>
          <span>Built with AI-assisted flight search.</span>
        </div>
      </footer>
    </div>
  )
}
