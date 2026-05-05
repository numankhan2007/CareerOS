/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { fetchCurrentUser, logoutUser } from '../api/auth'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async (shouldCallApi = true) => {
    // End backend session and clear local auth state.
    if (shouldCallApi) {
      try {
        await logoutUser()
      } catch {
        // Ignore network errors while forcing local logout.
      }
    }
    setUser(null)
  }, [])

  const loadUser = useCallback(async () => {
    // Restore session from backend httpOnly cookie.
    setLoading(true)

    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async () => {
    // Session cookie is set server-side; hydrate user state afterward.
    await loadUser()
  }, [loadUser])

  const updateUser = useCallback((updatedUser) => {
    // Sync local state after profile edits — no API call needed.
    setUser(updatedUser)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUser()
  }, [loadUser])

  useEffect(() => {
    // Auto-logout when global unauthorized events are emitted by API layer.
    const handleUnauthorized = () => {
      void logout(false)
      setLoading(false)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
    loadUser,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}