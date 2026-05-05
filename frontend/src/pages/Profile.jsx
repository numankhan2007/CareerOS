import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

import { fetchUserStats } from '../api/users'
import ChangePasswordForm from '../components/profile/ChangePasswordForm'
import DangerZone from '../components/profile/DangerZone'
import EditProfileForm from '../components/profile/EditProfileForm'
import ProfileHeader from '../components/profile/ProfileHeader'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'danger', label: 'Danger Zone' },
]

export default function Profile() {
  const { user, updateUser } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await fetchUserStats()
      setStats(data)
    } catch {
      // Stats are non-critical — header still renders without them.
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  // After profile save, sync the updated user into AuthContext
  // so Sidebar and header reflect the new name immediately.
  const handleProfileSave = (updatedUser) => {
    updateUser(updatedUser)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* ROW 1 — Profile Header (always visible) */}
      <ProfileHeader user={user} stats={stats} loading={statsLoading} />

      {/* ROW 2 — Tab Navigation */}
      <div className="flex gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition ${
              activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white/70'
            }`}
          >
            {tab.label}
            {/* Animated underline slides between tabs via layoutId. */}
            {activeTab === tab.id ? (
              <motion.div
                layoutId="profile-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent-blue"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab content with fade transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {activeTab === 'profile' ? (
            <EditProfileForm user={user} onSave={handleProfileSave} />
          ) : null}

          {activeTab === 'security' ? <ChangePasswordForm /> : null}

          {activeTab === 'danger' ? <DangerZone /> : null}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  )
}
