'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { analyticsAPI } from '@/lib/api'
import { ArrowPathIcon, ChartBarIcon, HeartIcon, EyeIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline'

type Platform = 'facebook' | 'instagram' | 'twitter' | 'linkedin'

interface AnalyticsData {
  posts: number
  impressions: number
  engagements: number
  likes: number
  retweets?: number
  replies?: number
  comments?: number
  shares?: number
  growthRate: string
  topPost: {
    text?: string
    caption?: string
    impressions: number
    likes: number
    retweets?: number
    comments?: number
    shares?: number
  } | null
}

export default function Analytics() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('twitter')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Fetch analytics when platform changes
    const fetchAnalytics = async () => {
      const currentPlatform = platforms.find(p => p.id === selectedPlatform)
      if (!currentPlatform?.connected) {
        setAnalyticsData(null)
        return
      }

      setLoadingAnalytics(true)
      try {
        const response = await analyticsAPI.getPlatformAnalytics(selectedPlatform)
        if (response && response.success) {
          setAnalyticsData(response.analytics)
        } else {
          setAnalyticsData(null)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        setAnalyticsData(null)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    if (user) {
      fetchAnalytics()
    }
  }, [selectedPlatform, user])

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

  const platforms = [
    { 
      id: 'twitter' as Platform, 
      name: 'X (Twitter)', 
      icon: 'X', 
      color: 'bg-slate-900',
      connected: !!user?.twitterAccount
    },
    { 
      id: 'instagram' as Platform, 
      name: 'Instagram', 
      icon: 'ig', 
      color: 'bg-blue-500',
      connected: !!user?.facebookAccount?.instagram_accounts?.length
    },
    { 
      id: 'facebook' as Platform, 
      name: 'Facebook', 
      icon: 'f', 
      color: 'bg-blue-600',
      connected: !!user?.facebookAccount
    },
    { 
      id: 'linkedin' as Platform, 
      name: 'LinkedIn', 
      icon: 'in', 
      color: 'bg-blue-700',
      connected: !!user?.linkedinAccount
    },
  ]

  const currentPlatform = platforms.find(p => p.id === selectedPlatform)

  // Use real analytics data or show loading/empty state
  const analytics = analyticsData

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">Analytics</h1>
              <p className="text-sm text-slate-500">Track your social media performance across platforms</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Platform Tabs */}
          <Card className="mb-8 border-slate-200">
            <CardContent className="p-2 flex space-x-2">
            {platforms.map((platform) => (
              <Button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                disabled={!platform.connected}
                variant={selectedPlatform === platform.id ? 'default' : 'secondary'}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  selectedPlatform === platform.id
                    ? 'shadow-sm'
                    : platform.connected
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center ${selectedPlatform === platform.id ? 'bg-white/10' : ''}`}>
                  <span className="text-xs font-bold text-white">
                    {platform.icon}
                  </span>
                </div>
                <span>{platform.name}</span>
              </Button>
            ))}
            </CardContent>
          </Card>

          {/* Analytics Content */}
          {loadingAnalytics ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-lg text-slate-600">Loading analytics...</span>
              </div>
            </div>
          ) : currentPlatform?.connected && analytics ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <ChartBarIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                        <span>↑</span>
                        <span>{analytics.growthRate}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Posts</p>
                    <p className="text-3xl font-semibold text-slate-900">{analytics.posts}</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <EyeIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Impressions</p>
                    <p className="text-3xl font-semibold text-slate-900">{analytics.impressions.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <HeartIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Engagements</p>
                    <p className="text-3xl font-semibold text-slate-900">{analytics.engagements.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <ChatBubbleLeftIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Likes</p>
                    <p className="text-3xl font-semibold text-slate-900">{analytics.likes.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Breakdown */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Engagement Breakdown</CardTitle>
                    <CardDescription>See how audiences are interacting.</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Likes</span>
                        <span className="text-sm font-semibold text-slate-900">{analytics.likes}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${analytics.engagements > 0 ? Math.min((analytics.likes / analytics.engagements) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">
                          {selectedPlatform === 'twitter' ? 'Retweets' : 'Shares'}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {selectedPlatform === 'twitter' ? (analytics.retweets || 0) : (analytics.shares || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${analytics.engagements > 0 ? Math.min(((selectedPlatform === 'twitter' ? (analytics.retweets || 0) : (analytics.shares || 0)) / analytics.engagements) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">
                          {selectedPlatform === 'twitter' ? 'Replies' : 'Comments'}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {selectedPlatform === 'twitter' ? (analytics.replies || 0) : (analytics.comments || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${analytics.engagements > 0 ? Math.min(((selectedPlatform === 'twitter' ? (analytics.replies || 0) : (analytics.comments || 0)) / analytics.engagements) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>

                {/* Top Performing Post */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Top Performing Post</CardTitle>
                    <CardDescription>Best post from the selected timeframe.</CardDescription>
                  </CardHeader>
                  <CardContent>
                  {analytics.topPost ? (
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <p className="text-slate-700 mb-4">
                        {selectedPlatform === 'instagram' 
                          ? (analytics.topPost.caption || 'No caption') 
                          : (analytics.topPost.text || 'No text')}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Impressions</p>
                          <p className="text-lg font-semibold text-slate-900">{analytics.topPost.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Likes</p>
                          <p className="text-lg font-semibold text-slate-900">{analytics.topPost.likes}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            {selectedPlatform === 'twitter' ? 'Retweets' : selectedPlatform === 'instagram' ? 'Comments' : 'Shares'}
                          </p>
                          <p className="text-lg font-semibold text-slate-900">
                            {selectedPlatform === 'twitter' 
                              ? (analytics.topPost.retweets || 0) 
                              : selectedPlatform === 'instagram' 
                              ? (analytics.topPost.comments || 0) 
                              : (analytics.topPost.shares || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-8 text-center">
                      <p className="text-slate-500">No posts yet</p>
                    </div>
                  )}
                  </CardContent>
                </Card>
              </div>

              {/* Chart Placeholder */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">Engagement Over Time</CardTitle>
                  <CardDescription>Visualization coming soon.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                    <p className="text-slate-500">Chart visualization coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Available</h3>
                <p className="text-slate-600 mb-6">
                  Connect your {currentPlatform?.name} account to see analytics
                </p>
                <Button onClick={() => router.push('/connect')}>
                  Connect Account
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
