import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import { updateProfile } from '../../api/users'

// Colors cycle through blue → purple → cyan per skill pill.
const PILL_COLORS = [
  'border-accent-blue/40 bg-accent-blue/15 text-accent-blue',
  'border-accent-purple/40 bg-accent-purple/15 text-accent-purple',
  'border-accent-cyan/40 bg-accent-cyan/15 text-accent-cyan',
]

// Parse comma-separated skills string into trimmed, non-empty array.
function parseSkills(raw) {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// Simple URL format check.
function isValidUrl(str) {
  if (!str) return true // optional field
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export default function EditProfileForm({ user, onSave }) {
  const [name, setName] = useState(user?.name || '')
  const [resumeLink, setResumeLink] = useState(user?.resume_link || '')
  const [skills, setSkills] = useState(parseSkills(user?.skills))
  const [skillInput, setSkillInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})
  const [skillsBanner, setSkillsBanner] = useState(false)

  // Reset form to the original user values.
  const handleCancel = useCallback(() => {
    setName(user?.name || '')
    setResumeLink(user?.resume_link || '')
    setSkills(parseSkills(user?.skills))
    setSkillInput('')
    setErrors({})
  }, [user])

  // Add a skill on Enter or comma key.
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const cleaned = skillInput.trim().replace(/,/g, '')
      if (!cleaned) return
      if (skills.length >= 20) return
      if (skills.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
        setSkillInput('')
        return
      }
      setSkills((prev) => [...prev, cleaned])
      setSkillInput('')
      // Dismiss the banner when user edits skills again.
      setSkillsBanner(false)
    }
  }

  const removeSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index))
    setSkillsBanner(false)
  }

  const validate = () => {
    const next = {}
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters.'
    if (resumeLink && !isValidUrl(resumeLink)) next.resumeLink = 'Enter a valid URL.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      const updated = await updateProfile({
        name: name.trim(),
        skills: skills.length > 0 ? skills.join(',') : null,
        resume_link: resumeLink.trim() || null,
      })
      onSave?.(updated)
      setToast({ message: 'Profile updated successfully', variant: 'success' })
      // Show recommendation nudge when user saves >= 1 skill.
      if (skills.length > 0) {
        setSkillsBanner(true)
      }
    } catch {
      setToast({ message: 'Failed to update profile', variant: 'error' })
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
        <h3 className="mb-5 text-sm font-semibold text-white">Personal Information</h3>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm text-slate-300">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-accent-blue/70 focus:ring-2 focus:ring-accent-blue/60"
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            ) : null}
          </div>

          {/* Email — read-only */}
          <div>
            <label htmlFor="profile-email" className="mb-2 block text-sm text-slate-300">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-slate-400 outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
          </div>

          {/* Resume Link */}
          <div>
            <label htmlFor="profile-resume" className="mb-2 block text-sm text-slate-300">
              Resume Link
            </label>
            <div className="flex gap-2">
              <input
                id="profile-resume"
                type="url"
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="flex-1 rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-accent-blue/70 focus:ring-2 focus:ring-accent-blue/60"
              />
              {resumeLink && isValidUrl(resumeLink) ? (
                <a
                  href={resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-accent-cyan transition hover:border-accent-cyan/40"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview
                </a>
              ) : null}
            </div>
            {errors.resumeLink ? (
              <p className="mt-1 text-xs text-red-400">{errors.resumeLink}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">
              Paste a link to your Google Drive, Notion, or PDF resume
            </p>
          </div>
        </div>

        {/* ── Skills section ── */}
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm text-slate-300">Skills</label>
            <span className="text-xs text-slate-500">({skills.length}/20)</span>
          </div>

          {/* Skill pills */}
          {skills.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${PILL_COLORS[i % 3]}`}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="ml-0.5 text-current opacity-70 transition hover:opacity-100"
                    aria-label={`Remove ${skill}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mb-3 text-xs text-slate-500">
              Add your skills to get better recommendations
            </p>
          )}

          {/* Skill text input */}
          {skills.length < 20 ? (
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="Type a skill + press Enter"
              className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 text-sm text-white outline-none transition focus:border-accent-blue/70 focus:ring-2 focus:ring-accent-blue/60"
            />
          ) : null}
        </div>

        {/* ── Footer buttons ── */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent-blue/35 transition hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : null}
            Save Changes
          </button>
        </div>
      </form>

      {/* Inline toast — auto-clears after 3s. */}
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

      {/* Skills recommendation nudge — shows once per save when >= 1 skill */}
      {skillsBanner ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-3 text-sm text-accent-cyan"
        >
          ✨ Skills saved!{' '}
          <Link
            to="/recommendations"
            className="font-semibold underline underline-offset-2 transition hover:text-white"
          >
            View your personalized recommendations →
          </Link>
        </motion.div>
      ) : null}
    </motion.div>
  )
}
