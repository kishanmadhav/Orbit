'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { postsAPI } from '@/lib/api'
import { 
  ArrowPathIcon,
  ClockIcon,
  PhotoIcon,
  FilmIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface Post {
  id: number
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin'
  platform_post_id: string
  content: string
  caption: string
  media_url: string | null
  media_type?: string
  permalink: string | null
  posted_at: string
  is_story: boolean
  created_at: string
}

export default function PostHistory() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all') // all, posts, stories

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  useEffect(() => {
    filterPosts()
  }, [posts, selectedPlatform, selectedType])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await postsAPI.getAllPosts(100)
      if (response.success) {
        setPosts(response.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = [...posts]

    // Filter by platform
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(post => post.platform === selectedPlatform)
    }

    // Filter by type (post vs story)
    if (selectedType === 'posts') {
      filtered = filtered.filter(post => !post.is_story)
    } else if (selectedType === 'stories') {
      filtered = filtered.filter(post => post.is_story)
    }

    setFilteredPosts(filtered)
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'bg-slate-900'
      case 'instagram': return 'bg-blue-500'
      case 'facebook': return 'bg-blue-600'
      case 'linkedin': return 'bg-blue-700'
      default: return 'bg-gray-500'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'X'
      case 'instagram': return 'ig'
      case 'facebook': return 'f'
      case 'linkedin': return 'in'
      default: return '?'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

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
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">Post History</h1>
              <p className="text-sm text-slate-500">View all your published posts and stories across platforms</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Filters */}
          <Card className="mb-6 border-slate-200">
            <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedPlatform('all')}
                    variant={selectedPlatform === 'all' ? 'default' : 'secondary'}
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => setSelectedPlatform('twitter')}
                    variant={selectedPlatform === 'twitter' ? 'default' : 'secondary'}
                    className={selectedPlatform === 'twitter' ? 'bg-slate-900 hover:bg-slate-800' : ''}
                  >
                    X
                  </Button>
                  <Button
                    onClick={() => setSelectedPlatform('instagram')}
                    variant={selectedPlatform === 'instagram' ? 'default' : 'secondary'}
                    className={selectedPlatform === 'instagram' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Instagram
                  </Button>
                  <Button
                    onClick={() => setSelectedPlatform('facebook')}
                    variant={selectedPlatform === 'facebook' ? 'default' : 'secondary'}
                  >
                    Facebook
                  </Button>
                  <Button
                    onClick={() => setSelectedPlatform('linkedin')}
                    variant={selectedPlatform === 'linkedin' ? 'default' : 'secondary'}
                    className={selectedPlatform === 'linkedin' ? 'bg-blue-700 hover:bg-blue-800' : ''}
                  >
                    LinkedIn
                  </Button>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedType('all')}
                    variant={selectedType === 'all' ? 'default' : 'secondary'}
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => setSelectedType('posts')}
                    variant={selectedType === 'posts' ? 'default' : 'secondary'}
                  >
                    Posts
                  </Button>
                  <Button
                    onClick={() => setSelectedType('stories')}
                    variant={selectedType === 'stories' ? 'default' : 'secondary'}
                  >
                    Stories
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-slate-600">Total Posts:</span>
                  <span className="ml-2 font-semibold text-slate-900">{filteredPosts.length}</span>
                </div>
                <div>
                  <span className="text-slate-600">Regular Posts:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {filteredPosts.filter(p => !p.is_story).length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Stories:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {filteredPosts.filter(p => p.is_story).length}
                  </span>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg text-slate-600">Loading posts...</span>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <PhotoIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts found</h3>
                <p className="text-slate-600">
                {selectedPlatform !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start creating content to see it here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Post Header */}
                  <CardHeader className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${getPlatformColor(post.platform)} rounded-lg flex items-center justify-center shadow-sm`}>
                          <span className="text-white text-xs font-bold">
                            {getPlatformIcon(post.platform)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 capitalize">{post.platform}</div>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>{formatDate(post.posted_at)}</span>
                          </div>
                        </div>
                      </div>
                      {post.is_story && (
                        <Badge className="flex items-center space-x-1 bg-blue-100 text-blue-700">
                          <FilmIcon className="w-3 h-3" />
                          <span>Story</span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  {/* Post Media */}
                  {post.media_url && (
                    <div className="relative aspect-square bg-slate-100">
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-700 line-clamp-3">
                      {post.caption || post.content || 'No caption'}
                    </p>
                    
                    {post.permalink && post.platform !== 'instagram' && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>View on {post.platform}</span>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
