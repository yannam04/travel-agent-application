import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Plane, Star } from 'lucide-react'
import RegisterForm from '../components/auth/RegisterForm'
import { useAuth } from '../context/AuthContext'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80'

export default function RegisterPage() {
  const { user } = useAuth()
  const [imgFailed, setImgFailed] = useState(false)
  // Captured once: redirect only if the user arrived already signed in.
  // A sign-up completed on this page updates `user` too, but that transition
  // is handled by RegisterForm's own success state + delayed navigate.
  const [wasAuthenticated] = useState(() => Boolean(user))

  if (wasAuthenticated) return <Navigate to="/profile" replace />

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left: destination image panel (hidden on mobile) */}
      <div className="relative hidden overflow-hidden md:block md:w-[38%] lg:w-[42%] xl:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-teal-900" />
        {!imgFailed && (
          <img
            src={HERO_IMAGE}
            alt="Mountain lake at sunrise"
            onError={() => setImgFailed(true)}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/25 to-slate-900/0" />

        <div className="relative flex h-full flex-col justify-end p-8 md:p-10 lg:p-12 xl:p-16">
          <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl xl:text-5xl">
            Explore more.
            <br />
            Travel further.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-slate-200 md:text-base">
            Join thousands of travelers using AI to find real, bookable flights that fit their
            budget.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/90">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            Loved by 12,000+ travelers
          </div>
        </div>
      </div>

      {/* Right: registration card */}
      <div className="flex w-full flex-1 flex-col px-5 py-8 sm:px-10 sm:py-12 lg:px-14 xl:px-20">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-slate-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-sm shadow-brand-500/30">
                <Plane size={18} strokeWidth={2.5} />
              </span>
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                Travel Agent
              </span>
            </Link>
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">Start your journey with us</p>

            <div className="mt-8">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
