'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { 
  HomeIcon, 
  CalendarIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  CogIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  LinkIcon,
  ClockIcon,
  ChartPieIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Connect', href: '/connect', icon: LinkIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Schedule Post', href: '/schedule', icon: CalendarIcon },
  { name: 'Post Calendar', href: '/calendar', icon: ClockIcon },
  { name: 'Post History', href: '/history', icon: DocumentTextIcon },
  { name: 'Usage', href: '/usage', icon: ChartPieIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div 
      className={`bg-white min-h-screen flex flex-col border-r border-slate-200 shadow-sm transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <div className="p-6 border-b border-slate-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 text-slate-700 group`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Bars3Icon className="w-6 h-6 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Menu</span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              {!isCollapsed && (
                <span className="whitespace-nowrap">
                  {item.name}
                </span>
              )}
              
              {/* Active indicator */}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-xl">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        {/* Logout Button */}
        <button
          onClick={logout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 group relative`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
          
          {isCollapsed && (
            <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-xl">
              Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
            </div>
          )}
        </button>

        {/* User Info */}
        <div 
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer group relative`}
          title={isCollapsed ? user?.displayName || 'User' : ''}
        >
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName}
              className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 font-semibold text-sm shadow-sm border-2 border-blue-100">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 whitespace-nowrap truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-slate-500 whitespace-nowrap truncate">{user?.email || ''}</p>
            </div>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-xl">
              <p className="font-medium">{user?.displayName || 'User'}</p>
              <p className="text-xs text-slate-300">{user?.email || ''}</p>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
