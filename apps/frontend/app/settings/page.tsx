'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function Settings() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-slate-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Settings</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600">
            Settings page coming soon...
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
