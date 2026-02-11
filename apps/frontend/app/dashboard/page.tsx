'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { socialAPI, brandAPI, analyticsAPI, postsAPI } from '@/lib/api'
import { 
  CalendarIcon, 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface AnalyticsData {
  platform: string
  followers?: number
  posts?: number
  engagement?: {
    likes: number
    comments: number
    shares?: number
  }
  impressions?: number
}

export default function Dashboard() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [organizationName, setOrganizationName] = useState<string>('')
  const [analyticsData, setAnalyticsData] = useState<{
    totalPosts: number
    totalImpressions: number
    totalLikes: number
    totalComments: number
  }>({
    totalPosts: 0,
    totalImpressions: 0,
    totalLikes: 0,
    totalComments: 0
  })
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  useEffect(() => {
    // Don't redirect if we're in the middle of an OAuth callback
    const params = new URLSearchParams(window.location.search)
    const isOAuthCallback = params.get('twitter_linked') || params.get('facebook_linked') || params.get('linkedin_linked')
    
    if (!loading && !user && !isOAuthCallback) {
      router.push('/')
    }
  }, [user, loading, router])

  // Refresh user data after OAuth callback (if redirected here)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('twitter_linked') || params.get('facebook_linked') || params.get('linkedin_linked')) {
      console.log('OAuth callback detected, refreshing user data...')
      refreshUser()
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [refreshUser])

  // Fetch brand profile for organization name
  useEffect(() => {
    const fetchBrandProfile = async () => {
      try {
        const profile = await brandAPI.getBrandProfile()
        if (profile?.organizationName) {
          setOrganizationName(profile.organizationName)
        }
      } catch (error) {
        console.error('Failed to fetch brand profile:', error)
      }
    }

    if (user) {
      fetchBrandProfile()
    }
  }, [user])

  // Fetch real analytics data from database
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      setLoadingAnalytics(true)
      try {
        let totalPosts = 0
        let totalImpressions = 0
        let totalLikes = 0
        let totalComments = 0

        console.log('=== Fetching Dashboard Analytics ===')

        // First, get post counts directly from database using postsAPI
        try {
          const postsData = await postsAPI.getAllPosts(1000)
          console.log('Posts from database:', postsData)
          if (postsData.success && postsData.posts) {
            totalPosts = postsData.count || 0
            console.log('Total posts from DB:', totalPosts)
          }
        } catch (err) {
          console.error('Failed to fetch posts:', err)
        }

        // Fetch analytics for connected platforms using the API wrapper
        const platforms: Array<'twitter' | 'instagram' | 'facebook' | 'linkedin'> = []
        
        if (user.twitterAccount) platforms.push('twitter')
        if (user.facebookAccount?.instagram_accounts?.length) platforms.push('instagram')
        if (user.facebookAccount) platforms.push('facebook')
        if (user.linkedinAccount) platforms.push('linkedin')

        console.log('Fetching analytics for platforms:', platforms)

        // Fetch analytics from each platform
        for (const platform of platforms) {
          try {
            console.log(`Fetching analytics for ${platform}...`)
            const analyticsData = await analyticsAPI.getPlatformAnalytics(platform)
            console.log(`${platform} analytics response:`, analyticsData)
            
            if (analyticsData) {
              // Use the higher of analytics posts or already counted posts
              if (analyticsData.posts > 0) {
                totalPosts = Math.max(totalPosts, analyticsData.posts)
              }
              totalImpressions += analyticsData.impressions || 0
              totalLikes += analyticsData.likes || 0
              totalComments += (analyticsData.comments || analyticsData.replies || 0)
            }
          } catch (err) {
            console.error(`Failed to fetch ${platform} analytics:`, err)
          }
        }

        console.log('Final totals:', { totalPosts, totalImpressions, totalLikes, totalComments })

        setAnalyticsData({
          totalPosts,
          totalImpressions,
          totalLikes,
          totalComments
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
  
  const stats = [
    { 
      name: 'Posts Created', 
      value: loadingAnalytics ? '...' : formatNumber(analyticsData.totalPosts), 
      change: '', 
      trend: 'up', 
      icon: CalendarIcon, 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
    { 
      name: 'Total Impressions', 
      value: loadingAnalytics ? '...' : formatNumber(analyticsData.totalImpressions), 
      change: '', 
      trend: 'up', 
      icon: EyeIcon, 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
    { 
      name: 'Total Likes', 
      value: loadingAnalytics ? '...' : formatNumber(analyticsData.totalLikes), 
      change: '', 
      trend: 'up', 
      icon: HeartIcon, 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
    { 
      name: 'Total Comments', 
      value: loadingAnalytics ? '...' : formatNumber(analyticsData.totalComments), 
      change: '', 
      trend: 'up', 
      icon: ChatBubbleLeftIcon, 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
  ]

  // Social platforms with real connection status from backend
  const socialPlatforms = [
    { 
      name: 'Facebook', 
      icon: 'f', 
      color: 'bg-blue-600', 
      connected: !!user?.facebookAccount,
      username: user?.facebookAccount?.facebook_name || '',
      onConnect: () => socialAPI.connectFacebook(),
      onDisconnect: async () => {
        try {
          await socialAPI.unlinkFacebook()
          await refreshUser()
        } catch (error) {
          console.error('Failed to unlink Facebook:', error)
          throw error
        }
      }
    },
    { 
      name: 'Instagram', 
      icon: 'ig', 
      color: 'bg-blue-500', 
      connected: !!user?.facebookAccount?.instagram_accounts?.length,
      username: user?.facebookAccount?.instagram_accounts?.[0]?.instagram_username || '',
      onConnect: () => socialAPI.connectFacebook(), // Instagram connects via Facebook
      onDisconnect: async () => {
        try {
          await socialAPI.unlinkFacebook()
          await refreshUser()
        } catch (error) {
          console.error('Failed to unlink Facebook/Instagram:', error)
          throw error
        }
      }
    },
    { 
      name: 'X (Twitter)', 
      icon: 'X', 
      color: 'bg-slate-900', 
      connected: !!user?.twitterAccount,
      username: user?.twitterAccount?.username || '',
      onConnect: () => socialAPI.connectTwitter(),
      onDisconnect: async () => {
        try {
          await socialAPI.unlinkTwitter()
          await refreshUser()
        } catch (error) {
          console.error('Failed to unlink Twitter:', error)
          throw error
        }
      }
    },
    { 
      name: 'LinkedIn', 
      icon: 'in', 
      color: 'bg-blue-700', 
      connected: !!user?.linkedinAccount,
      username: user?.linkedinAccount?.linkedin_name || '',
      onConnect: () => socialAPI.connectLinkedin(),
      onDisconnect: async () => {
        try {
          await socialAPI.unlinkLinkedin()
          await refreshUser()
        } catch (error) {
          console.error('Failed to unlink LinkedIn:', error)
          throw error
        }
      }
    },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-5 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Social Genie</h1>
                <p className="text-xs text-slate-500">a product by Agentic Genie</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button asChild className="shadow-sm">
                <Link href="/generator">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Generate Content</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Hero Banner */}
          <Card className="mb-8 border-slate-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <Badge variant="secondary" className="mb-3 text-xs text-slate-600">
                Overview
              </Badge>
              <h2 className="text-3xl font-semibold text-slate-900 mb-2">
                Welcome back, {organizationName || user.displayName}!
              </h2>
              <p className="text-slate-600 text-lg font-light">Here's what's happening with your brand today.</p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card 
                key={stat.name} 
                className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    {stat.change && (
                      <div className="flex items-center space-x-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                        <span>↑</span>
                        <span>{stat.change}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                  <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* AI Content Generator */}
            <Card className="border-blue-100 bg-blue-50/60">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <SparklesIcon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Generator</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Create engaging social media content instantly with Sora 2 visuals and GPT-4 captions.
                </p>
                <Button asChild className="w-full shadow-sm">
                  <Link href="/generator">
                    <SparklesIcon className="w-5 h-5" />
                    <span>Generate Content</span>
                  </Link>
                </Button>
                
                <div className="mt-6 pt-6 border-t border-blue-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">AI-Powered</span>
                    <span className="font-semibold text-slate-900">Sora 2 + GPT-4</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start Guide */}
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Quick Start Guide</CardTitle>
                <CardDescription>Get up and running in minutes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Connect Your Accounts</h4>
                    <p className="text-sm text-slate-600">Link your Twitter, Instagram, Facebook, and LinkedIn accounts below</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Generate AI Content</h4>
                    <p className="text-sm text-slate-600">Use our AI generator to create images and captions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Post & Schedule</h4>
                    <p className="text-sm text-slate-600">Post immediately or schedule for later</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Connections */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Social Connections</CardTitle>
                <CardDescription>Manage your connected social media accounts.</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs text-slate-600">
                {socialPlatforms.filter(p => p.connected).length}/{socialPlatforms.length} connected
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                {socialPlatforms.map((platform) => (
                  <div 
                    key={platform.name}
                    className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${
                      platform.connected
                        ? 'border-blue-200 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center shadow-sm`}>
                        <span className="text-white text-sm font-bold">{platform.icon}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 block">{platform.name}</span>
                        <span className="text-xs text-slate-500">
                          {platform.connected ? `@${platform.username}` : 'Not connected'}
                        </span>
                      </div>
                    </div>
                    {platform.connected ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async (e) => {
                            e.preventDefault()
                            if (confirm(`Are you sure you want to disconnect ${platform.name}?`)) {
                              try {
                                await platform.onDisconnect()
                              } catch (error) {
                                console.error(`Failed to disconnect ${platform.name}:`, error)
                                alert(`Failed to disconnect ${platform.name}. Please try again.`)
                              }
                            }
                          }}
                          className="text-xs text-slate-500 hover:text-red-600"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={platform.onConnect} size="sm">
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
