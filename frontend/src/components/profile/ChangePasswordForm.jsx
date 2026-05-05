import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { changePassword } from '../../api/users'
import { getPasswordStrengthChecks } from '../../utils/validation'

// Derive strength level from the 5 password criteria.
function getStrengthLevel(password) {
  if (!password) return { level: 'none', width: '0%', color: '', label: '' }
  const checks = getPasswordStrengthChecks(password)
  const passed = Object.values(checks).filter(Boolean).length
  if (passed <= 2) return { level: 'weak', width: '33%', color: 'bg-red-400', label: 'Weak' }
  if (passed <= 3) return { level: 'medium', width: '66%', color: 'bg-yellow-400', label: 'Medium' }
  return { level: 'strong', width: '100%', color: 'bg-emerald-400', label: 'Strong' }
}

// Reusable password field with show/hide toggle.
function PasswordField({ id, label, value, onChange, error, extra }) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 pr-11 text-white outline-none transition focus:border-accent-blue/70 focus:ring-2 focus:ring-accent-blue/60"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
      {extra || null}
    </div>
  )
}

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)

  const strength = getStrengthLevel(newPassword)

  const validate = () => {
    const next = {}
    if (!currentPassword) next.current = 'Current password is required.'
    if (!newPassword) next.new = 'New password is required.'
    else if (newPassword.length < 8) next.new = 'Password must be at least 8 characters.'
    if (!confirmPassword) next.confirm = 'Please confirm your new password.'
    else if (newPassword !== confirmPassword) next.confirm = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      // Clear all fields on success.
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
      setToast({ message: 'Password updated successfully', variant: 'success' })
    } catch (err) {
      const detail = err?.response?.data?.detail
      setToast({
        message: typeof detail === 'string' ? detail : 'Failed to update password',
        variant: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h3 className="mb-5 text-sm font-semibold text-white">Change Password</h3>

        <div className="space-y-5">
          <PasswordField
            id="current-password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.current}
          />

          <PasswordField
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.new}
            extra={
              newPassword ? (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p
                    className={`mt-1 text-xs ${
                      strength.level === 'weak'
                        ? 'text-red-400'
                        : strength.level === 'medium'
                          ? 'text-yellow-400'
                          : 'text-emerald-400'
                    }`}
                  >
                    {strength.label}
                  </p>
                </div>
              ) : null
            }
          />

          <PasswordField
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirm}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent-blue/35 transition hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : null}
            Update Password
          </button>
        </div>
      </form>

      {/* Inline toast */}
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            toast.variant === 'success'
              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
              : 'border-red-400/40 bg-red-500/15 text-red-200'
          }`}
          onAnimationComplete={() => {
            setTimeout(() => setToast(null), 3000)
          }}
        >
          {toast.message}
        </motion.div>
      ) : null}
    </motion.div>
  )
}
