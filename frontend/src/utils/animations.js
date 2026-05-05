/**
 * Shared Framer Motion animation variants & transition presets.
 *
 * Import these in any component instead of defining animation objects
 * inline. Keeps motion behavior consistent across the entire app.
 */

// ── Variant objects ─────────────────────────────────────────────────────────

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

// ── Transition presets ──────────────────────────────────────────────────────

export const defaultTransition = { duration: 0.3, ease: 'easeOut' }

export const slowTransition = { duration: 0.6, ease: 'easeOut' }

export const springTransition = { type: 'spring', stiffness: 300, damping: 24 }

// ── Page-level transition (used by PageTransitionWrapper) ───────────────────

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: defaultTransition,
}

// ── Toast slide in/out (from right) ─────────────────────────────────────────

export const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
}

// ── Micro-interaction presets ───────────────────────────────────────────────

export const buttonHover = { scale: 1.02 }
export const buttonTap = { scale: 0.98 }
