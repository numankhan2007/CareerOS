import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'

import { toastVariants, defaultTransition } from '../utils/animations'

const VARIANT_STYLES = {
  success: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
  error: 'border-red-400/40 bg-red-500/15 text-red-200',
  info: 'border-accent-blue/40 bg-accent-blue/15 text-accent-blue',
}

export default function Toast({ message, variant = 'info', onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timer = setTimeout(() => {
      onClose?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [message, onClose])

  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.info

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={defaultTransition}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className={`rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${style}`}>
            {message}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
