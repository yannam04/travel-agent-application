import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Mail, Plane } from 'lucide-react'
import { requestPasswordReset } from '../api/authApi'
import TextField from '../components/TextField'

export default function ForgotPasswordPage() {
  const formId = useId()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const data = await requestPasswordReset(email.trim())
      setResult(data)
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
          {result ? (
            <div role="status" className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Mail size={26} />
              </div>
              <h1 className="font-display text-xl font-bold text-slate-900">Check your email</h1>
              <p className="text-sm text-slate-500">{result.message}</p>

              {result.reset_url && (
                <div className="mt-2 w-full rounded-xl bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
                  <p className="font-semibold">Dev mode notice</p>
                  <p className="mt-1">
                    No email service is configured in this project, so here&apos;s the reset link
                    directly:
                  </p>
                  <Link
                    to={result.reset_url.replace('/travelagent', '')}
                    className="mt-2 block break-all font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {window.location.origin}
                    {result.reset_url}
                  </Link>
                </div>
              )}

              <Link to="/login" className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Forgot your password?
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none cursor-pointer"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Remembered it?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                    Back to sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
