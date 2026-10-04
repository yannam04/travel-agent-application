import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { searchAirports, formatAirport } from '../../data/airports'

const DEFAULT_LABEL_CLASSNAME =
  'flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-50 sm:border-r sm:border-slate-100'

export default function AirportSelect({
  icon: Icon,
  iconClassName,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  required,
  labelClassName = DEFAULT_LABEL_CLASSNAME,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const results = searchAirports(query)

  function selectAirport(airport) {
    onChange(formatAirport(airport))
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={rootRef} className="relative flex-1">
      <label className={labelClassName}>
        <Icon size={18} className={`shrink-0 ${iconClassName}`} />
        <div className="flex w-full flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </span>
          <input
            type="text"
            value={open ? query : value}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => {
              setOpen(true)
              setQuery('')
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete="off"
            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <ChevronDown
          size={15}
          className={`shrink-0 text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </label>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-900/10">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-400">No airports found</div>
          ) : (
            results.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectAirport(airport)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-brand-50 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-800">
                    {airport.city}, {airport.country}
                  </div>
                  <div className="truncate text-xs text-slate-400">{airport.name}</div>
                </div>
                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold tracking-wide text-slate-600">
                  {airport.code}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
