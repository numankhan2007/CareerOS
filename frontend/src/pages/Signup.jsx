import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { signupUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import {
  getPasswordStrengthChecks,
  getSignupValidationError,
  normalizeEmail,
} from '../utils/validation'

export default function Signup() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [emailHint, setEmailHint] = useState('')

  const passwordChecks = getPasswordStrengthChecks(password)

  // Skip auth page if user already has an active session.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  function handleEmailChange(event) {
    const nextValue = event.target.value
    setEmail(nextValue)

    const normalized = normalizeEmail(nextValue)
    if (normalized && normalized !== nextValue) {
      setEmailHint('Will submit as ' + normalized)
    } else {
      setEmailHint('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const validationError = getSignupValidationError({ name, email, password })
    if (validationError) {
      setError(validationError)
      return
    }

    const normalizedName = name.trim()
    const normalizedEmail = normalizeEmail(email)

    setIsSubmitting(true)

    try {
      await signupUser(normalizedName, normalizedEmail, password)
      await login()
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Signup failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Ambient glow background for neon glassmorphism look. */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-purple/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-accent-blue/20 blur-3xl" />

      <motion.section
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-300">Start organizing your career journey today.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-slate-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-accent-blue/70 focus:ring-2 focus:ring-accent-blue/60"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-accent-blue/70 focus:ring-2 focus:ring-accent-blue/60"
              placeholder="you@example.com"
            />
            {emailHint ? <p className="mt-2 text-xs text-accent-cyan">{emailHint}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-accent-blue/70 focus:ring-2 focus:ring-accent-blue/60"
              placeholder="••••••••"
            />
            <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-slate-300">
              <p className={passwordChecks.minLength ? 'text-accent-cyan' : 'text-slate-400'}>At least 8 characters</p>
              <p className={passwordChecks.uppercase ? 'text-accent-cyan' : 'text-slate-400'}>At least one uppercase letter</p>
              <p className={passwordChecks.lowercase ? 'text-accent-cyan' : 'text-slate-400'}>At least one lowercase letter</p>
              <p className={passwordChecks.number ? 'text-accent-cyan' : 'text-slate-400'}>At least one number</p>
              <p className={passwordChecks.special ? 'text-accent-cyan' : 'text-slate-400'}>At least one special character</p>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-accent-blue px-4 py-3 font-medium text-white shadow-lg shadow-accent-blue/35 transition hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:text-accent-cyan/80">
            Login
          </Link>
        </p>
      </motion.section>
    </main>
  )
}