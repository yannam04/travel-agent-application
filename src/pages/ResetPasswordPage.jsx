import { useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, Plane } from 'lucide-react'
import { resetPassword } from '../api/authApi'
import PasswordField from '../components/auth/PasswordField'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const formId = useId()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const errors = {}
  if (!password) errors.password = 'Enter a new password.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!confirmPassword) errors.confirmPassword = 'Confirm your new password.'
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setTouched({ password: true, confirmPassword: true })
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await resetPassword({ token, password })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-extrabold tracking-tight text-slate-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30">
            <Plane size={18} strokeWidth={2.5} />
          </span>
          <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            Travel Agent
          </span>
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
          {!token ? (
            <div className="text-center">
              <h1 className="font-display text-xl font-bold text-slate-900">Invalid reset link</h1>
              <p className="mt-2 text-sm text-slate-500">
                This link is missing its reset token. Request a new one below.
              </p>
              <Link
                to="/forgot-password"
                className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Request a new link
              </Link>
            </div>
          ) : success ? (
            <div role="status" className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="text-emerald-600" size={40} />
              <h1 className="font-display text-xl font-bold text-slate-900">Password updated</h1>
              <p className="text-sm text-slate-500">You can now sign in with your new password.</p>
              <Link
                to="/login"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Set a new password
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Choose a new password for your account.
              </p>

              <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <PasswordField
                  id={`${formId}-password`}
                  label="New Password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  error={touched.password ? errors.password : undefined}
                />

                <PasswordField
                  id={`${formId}-confirm-password`}
                  label="Confirm New Password"
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none cursor-pointer"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
