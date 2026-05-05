import { Bookmark, Compass, KanbanSquare, LayoutDashboard, Sparkles, UserCircle } from 'lucide-react'

export const routeConfig = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/explore',
    label: 'Explore',
    icon: Compass,
  },
  {
    path: '/bookmarks',
    label: 'Bookmarks',
    icon: Bookmark,
  },
  {
    path: '/tracker',
    label: 'Tracker',
    icon: KanbanSquare,
  },
  {
    path: '/recommendations',
    label: 'Recommendations',
    icon: Sparkles,
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: UserCircle,
  },
]
