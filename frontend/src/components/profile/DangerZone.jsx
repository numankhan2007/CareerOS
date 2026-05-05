import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { deleteAccount } from '../../api/users'
import { useAuth } from '../../context/AuthContext'

export default function DangerZone() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const isConfirmed = confirmText === 'DELETE'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      setToast({ message: 'Account deleted. Goodbye! 👋', variant: 'info' })
      // Small delay so the toast is visible before redirect.
      setTimeout(async () => {
        await logout(false)
        navigate('/login', { replace: true })
      }, 800)
    } catch {
      setToast({ message: 'Failed to delete account. Please try again.', variant: 'error' })
      setDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="rounded-2xl border border-red-500/30 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
        </div>

        <div className="mt-4">
          <p className="text-sm text-slate-300">
            Permanently delete your account, all applications, and bookmarks.
            This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-4 rounded-xl border border-red-400/40 px-5 py-2.5 text-sm font-medium text-red-300 transition hover:border-red-400/70 hover:bg-red-500/10"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              // Close on overlay click.
              if (e.target === e.currentTarget) {
                setShowModal(false)
                setConfirmText('')
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mx-4 w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0b0f1a] p-6 shadow-2xl"
            >
              <h4 className="text-lg font-semibold text-white">Are you absolutely sure?</h4>
              <p className="mt-3 text-sm text-slate-300">
                Type <span className="font-bold text-red-400">DELETE</span> to confirm account
                deletion.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="mt-4 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-red-400/60 focus:ring-2 focus:ring-red-400/40"
                autoFocus
              />

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setConfirmText('')
                  }}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isConfirmed || deleting}
                  onClick={handleDelete}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                    isConfirmed
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'cursor-not-allowed border border-red-400/20 text-red-400/40'
                  }`}
                >
                  {deleting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  ) : null}
                  Delete My Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Inline toast */}
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            toast.variant === 'error'
              ? 'border-red-400/40 bg-red-500/15 text-red-200'
              : 'border-accent-blue/40 bg-accent-blue/15 text-accent-blue'
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
