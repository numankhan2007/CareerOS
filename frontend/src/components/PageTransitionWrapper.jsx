import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

import { pageTransition, defaultTransition } from '../utils/animations'

export default function PageTransitionWrapper({ children }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={defaultTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
