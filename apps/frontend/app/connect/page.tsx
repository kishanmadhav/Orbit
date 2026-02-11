'use client'

import { useEffect } from 'react'
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
import { socialAPI } from '@/lib/api'
import { 
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function Connect() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect if we're in the middle of an OAuth callback
    const params = new URLSearchParams(window.location.search)
    const isOAuthCallback = params.get('twitter_linked') || params.get('facebook_linked') || params.get('linkedin_linked')
    
    if (!loading && !user && !isOAuthCallback) {
      router.push('/')
    }
  }, [user, loading, router])

  // Refresh user data after OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('twitter_linked') || params.get('facebook_linked') || params.get('linkedin_linked')) {
      console.log('OAuth callback detected, refreshing user data...')
      refreshUser()
      // Clean up URL
      window.history.replaceState({}, '', '/connect')
    }
  }, [refreshUser])

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

  const socialPlatforms = [
    { 
      name: 'Facebook', 
      icon: 'f', 
      color: 'bg-blue-600', 
      connected: !!user?.facebookAccount,
      username: user?.facebookAccount?.facebook_name || '',
      description: 'Connect your Facebook account to post directly to your pages',
      onConnect: () => {
        window.location.href = 'https://social-genie-backend.azurewebsites.net/auth/facebook'
      },
      onDisconnect: async () => {
        await socialAPI.unlinkFacebook()
        await refreshUser()
      }
    },
    { 
      name: 'Instagram', 
      icon: 'ig', 
      color: 'bg-blue-500', 
      connected: !!user?.facebookAccount?.instagram_accounts?.length,
      username: user?.facebookAccount?.instagram_accounts?.[0]?.instagram_username || '',
      description: 'Connect via Facebook to post to your Instagram Business account',
      onConnect: () => {
        window.location.href = 'https://social-genie-backend.azurewebsites.net/auth/facebook'
      },
      onDisconnect: async () => {
        await socialAPI.unlinkFacebook()
        await refreshUser()
      }
    },
    { 
      name: 'X (Twitter)', 
      icon: 'X', 
      color: 'bg-slate-900', 
      connected: !!user?.twitterAccount,
      username: user?.twitterAccount?.username || '',
      description: 'Connect your X (Twitter) account to share posts with your followers',
      onConnect: () => {
        window.location.href = 'https://social-genie-backend.azurewebsites.net/auth/twitter'
      },
      onDisconnect: async () => {
        await socialAPI.unlinkTwitter()
        await refreshUser()
      }
    },
    { 
      name: 'LinkedIn', 
      icon: 'in', 
      color: 'bg-blue-700', 
      connected: !!user?.linkedinAccount,
      username: user?.linkedinAccount?.linkedin_name || '',
      description: 'Connect your LinkedIn profile to share professional updates with your network',
      onConnect: () => {
        window.location.href = 'https://social-genie-backend.azurewebsites.net/auth/linkedin'
      },
      onDisconnect: async () => {
        await socialAPI.unlinkLinkedin()
        await refreshUser()
      }
    },
  ]

  const connectedCount = socialPlatforms.filter(p => p.connected).length

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">Connect Accounts</h1>
              <p className="text-sm text-slate-500">Link your social media accounts to start posting</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Progress Banner */}
          <Card className="mb-8 border-slate-200 bg-white">
            <CardContent className="p-8">
              <Badge variant="secondary" className="mb-3 text-xs text-slate-600">
                Connections
              </Badge>
              <h2 className="text-3xl font-semibold text-slate-900 mb-2">Connect Your Social Media</h2>
              <p className="text-slate-600 text-lg font-light mb-4">
                Connect at least one platform to start generating and posting AI content
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-slate-100 px-4 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-slate-900">{connectedCount}/4</span>
                  <span className="text-slate-500 ml-2">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialPlatforms.map((platform) => (
              <Card 
                key={platform.name}
                className={`border transition-all duration-300 hover:shadow-md ${
                  platform.connected
                    ? 'border-blue-200 bg-blue-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 ${platform.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-lg font-bold">{platform.icon}</span>
                    </div>
                    {platform.connected && (
                      <CheckCircleIcon className="w-7 h-7 text-green-500" />
                    )}
                  </div>
                  <CardTitle className="text-xl text-slate-900">{platform.name}</CardTitle>
                  <CardDescription className="min-h-[40px] text-sm text-slate-600">
                    {platform.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {platform.connected ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <span className="font-medium">Connected as:</span>
                          <br />
                          <span className="text-green-600">@{platform.username}</span>
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
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
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={platform.onConnect}
                      className="w-full"
                    >
                      Connect {platform.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Help Section */}
          <Card className="mt-8 border-blue-200 bg-blue-50/60">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Need Help Connecting?</CardTitle>
              <CardDescription className="text-blue-800">A few tips to get setup quickly.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Facebook & Instagram:</strong> Make sure you have a Facebook Page linked to an Instagram Business account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>X (Twitter):</strong> You'll need to authorize Social Genie to post on your behalf</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>LinkedIn:</strong> Authorize Social Genie to share posts to your LinkedIn profile</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Permissions:</strong> We only request the minimum permissions needed to post content</span>
              </li>
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {connectedCount > 0 && (
            <div className="mt-8 text-center">
              <Button onClick={() => router.push('/schedule')} className="px-8 py-6 shadow-sm">
                Continue to Schedule Post
                <span>→</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
