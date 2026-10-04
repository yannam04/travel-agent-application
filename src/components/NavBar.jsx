import { NavLink, useNavigate } from 'react-router-dom'
import { Plane } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/30'
      : 'text-slate-600 hover:text-brand-600'
  }`

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-y-4 border-brand-500 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <NavLink
          to="/"
          className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-slate-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30">
            <Plane size={17} strokeWidth={2.5} />
          </span>
          <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            Travel Agent
          </span>
        </NavLink>

        <div className="flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            Search Flights
          </NavLink>
          <NavLink to="/trips" className={navLinkClass}>
            My Trips
          </NavLink>

          {user ? (
            <>
              <NavLink to="/profile" className={navLinkClass}>
                {user.name}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
