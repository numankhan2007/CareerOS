import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { loginUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { isValidEmail, normalizeEmail } from '../utils/validation'

export default function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const AnimatedSection = motion.section

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [emailHint, setEmailHint] = useState('')

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

    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    if (!password.trim()) {
      setError('Password cannot be empty.')
      return
    }

    setIsSubmitting(true)

    try {
      await loginUser(normalizedEmail, password)
      await login()
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Ambient glow background for neon glassmorphism look. */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-blue/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-accent-cyan/20 blur-3xl" />

      <AnimatedSection
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-300">Login to continue building your CareerOS.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              'Login'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          New to CareerOS?{' '}
          <Link to="/signup" className="text-accent-cyan hover:text-accent-cyan/80">
            Create account
          </Link>
        </p>
      </AnimatedSection>
    </main>
  )
}