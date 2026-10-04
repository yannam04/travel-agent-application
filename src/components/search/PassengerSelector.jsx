import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Minus, Plus, Users } from 'lucide-react'

const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
]

function summarize({ adults, children, infants, cabinClass }) {
  const totalPassengers = adults + children + infants
  const passengerLabel = `${totalPassengers} ${totalPassengers === 1 ? 'Passenger' : 'Passengers'}`
  const cabinLabel = CABIN_CLASSES.find((c) => c.value === cabinClass)?.label || 'Economy'
  return `${passengerLabel} · ${cabinLabel}`
}

function Counter({ label, sublabel, count, min, max, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        <div className="text-xs text-slate-400">{sublabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(count - 1)}
          disabled={disabled || count <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Minus size={14} />
        </button>
        <span className="w-4 text-center text-sm font-semibold text-slate-800">{count}</span>
        <button
          type="button"
          onClick={() => onChange(count + 1)}
          disabled={disabled || count >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function PassengerSelector({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function patch(next) {
    onChange({ ...value, ...next })
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Passengers &amp; Class</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        <Users size={18} className="shrink-0 text-brand-500" />
        <span className="w-full truncate text-sm font-medium text-slate-800">{summarize(value)}</span>
        <ChevronDown size={15} className={`shrink-0 text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 w-full min-w-[280px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-900/10 sm:w-80">
          <div className="divide-y divide-slate-100">
            <Counter
              label="Adults"
              sublabel="12+ years"
              count={value.adults}
              min={1}
              max={9}
              onChange={(next) =>
                patch({ adults: next, infants: Math.min(value.infants, next) })
              }
            />
            <Counter
              label="Children"
              sublabel="2–11 years"
              count={value.children}
              min={0}
              max={8}
              onChange={(next) => patch({ children: next })}
            />
            <Counter
              label="Infants"
              sublabel="Under 2, on lap"
              count={value.infants}
              min={0}
              max={value.adults}
              onChange={(next) => patch({ infants: next })}
            />
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="mb-2 text-sm font-medium text-slate-800">Cabin class</div>
            <div className="grid grid-cols-2 gap-2">
              {CABIN_CLASSES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => patch({ cabinClass: c.value })}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    value.cabinClass === c.value
                      ? 'border-transparent bg-accent-500 text-white shadow-sm shadow-accent-500/30'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
