import { createContext, useContext, useEffect, useState } from 'react'
import { fetchProfile, loginUser, logoutUser, registerUser } from '../api/authApi'

const AuthContext = createContext(null)
const TOKEN_KEY = 'travelagent_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetchProfile(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  function applySession(session) {
    localStorage.setItem(TOKEN_KEY, session.token)
    setToken(session.token)
    setUser(session.user)
  }

  async function login(email, password) {
    const session = await loginUser({ email, password })
    applySession(session)
  }

  async function register(name, email, password) {
    const session = await registerUser({ name, email, password })
    applySession(session)
  }

  function logout() {
    if (token) logoutUser(token).catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
