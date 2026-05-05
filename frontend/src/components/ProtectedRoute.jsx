import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-blue/25 border-t-accent-cyan shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // Keep the route blocked until auth bootstrap finishes.
  if (loading) {
    return <FullScreenSpinner />
  }

  // Send unauthenticated users to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}