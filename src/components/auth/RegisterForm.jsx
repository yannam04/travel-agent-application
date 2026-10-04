import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PasswordField from './PasswordField'
import GoogleButton from './GoogleButton'
import TextField from '../TextField'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}
  const name = values.fullName.trim()
  if (!name) errors.fullName = 'Enter your full name.'
  else if (name.length < 2) errors.fullName = 'Name must be at least 2 characters.'

  const email = values.email.trim()
  if (!email) errors.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'

  if (!values.password) errors.password = 'Create a password.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'

  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.'

  return errors
}

export default function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const formId = useId()

  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [touched, setTouched] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [googleNotice, setGoogleNotice] = useState(false)

  const errors = validate(values)

  function handleChange(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }))
  }

  function handleBlur(field) {
    return () => setTouched((t) => ({ ...t, [field]: true }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })

    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await register(values.fullName.trim(), values.email.trim(), values.password)
      setSuccess(true)
      setTimeout(() => navigate('/profile'), 1200)
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-10 text-center"
      >
        <CheckCircle2 className="text-emerald-600" size={40} />
        <p className="text-base font-semibold text-emerald-800">Account created!</p>
        <p className="text-sm text-emerald-700">Taking you to your profile…</p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {submitError}
        </div>
      )}

      <TextField
        id={`${formId}-name`}
        label="Full Name"
        type="text"
        autoComplete="name"
        placeholder="Jane Doe"
        value={values.fullName}
        onChange={handleChange('fullName')}
        onBlur={handleBlur('fullName')}
        error={touched.fullName ? errors.fullName : undefined}
      />

      <TextField
        id={`${formId}-email`}
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="jane@example.com"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={touched.email ? errors.email : undefined}
      />

      <PasswordField
        id={`${formId}-password`}
        label="Password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={values.password}
        onChange={handleChange('password')}
        onBlur={handleBlur('password')}
        error={touched.password ? errors.password : undefined}
      />

      <PasswordField
        id={`${formId}-confirm-password`}
        label="Confirm Password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={values.confirmPassword}
        onChange={handleChange('confirmPassword')}
        onBlur={handleBlur('confirmPassword')}
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
      />

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none cursor-pointer"
      >
        {submitting && <Loader2 size={18} className="animate-spin" />}
        {submitting ? 'Creating account…' : 'Create Account'}
      </button>

      <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div>
        <GoogleButton onClick={() => setGoogleNotice(true)} />
        {googleNotice && (
          <p role="status" className="mt-2 text-center text-xs text-slate-400">
            Google sign-up isn&apos;t connected in this demo yet.
          </p>
        )}
      </div>

      <p className="text-center text-xs leading-relaxed text-slate-400">
        By creating an account, you agree to our{' '}
        <a
          href="/terms"
          className="font-medium text-slate-500 underline underline-offset-2 hover:text-blue-600"
        >
          Terms &amp; Conditions
        </a>{' '}
        and{' '}
        <a
          href="/privacy"
          className="font-medium text-slate-500 underline underline-offset-2 hover:text-blue-600"
        >
          Privacy Policy
        </a>
        .
      </p>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </form>
  )
}
