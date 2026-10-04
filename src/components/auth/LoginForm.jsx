import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import TextField from '../TextField'
import PasswordField from './PasswordField'

export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const formId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/profile')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <TextField
        id={`${formId}-email`}
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="jane@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div>
        <PasswordField
          id={`${formId}-password`}
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="mt-2 text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none cursor-pointer"
      >
        {submitting && <Loader2 size={18} className="animate-spin" />}
        {submitting ? 'Signing in…' : 'Login'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Create account
        </Link>
      </p>
    </form>
  )
}
