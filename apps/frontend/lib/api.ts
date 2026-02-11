// API client for communicating with the backend server

// HARDCODED for production deployment
const BACKEND_URL = 'https://social-genie-backend.azurewebsites.net'

// Use runtime detection for API URL
function getApiUrl() {
  // Always use production backend for now
  if (typeof window !== 'undefined') {
    return BACKEND_URL
  }
  
  // Check for environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Fallback to production backend
  return BACKEND_URL
}


export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  provider: string
  twitterAccount?: {
    id: string
    username: string
    profile_image_url: string
  }
  instagramAccount?: {
    id: string
    username: string
    access_token: string
  }
  facebookAccount?: {
    facebook_id: string
    facebook_name: string
    instagram_accounts: Array<{
      instagram_user_id: string
      instagram_username: string
      page_id: string
      page_name: string
      page_access_token: string
    }>
  }
  linkedinAccount?: {
    linkedin_id: string
    linkedin_name: string
  }
}

export interface GeneratedContent {
  success: boolean
  preview: boolean
  image_url: string // S3 URL for permanent storage
  image_base64: string // Base64 for immediate preview
  caption: string
  revised_prompt: string
  s3_url: string // Store this for posting
}

// Helper function to handle fetch requests with credentials
async function fetchWithCredentials(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important for sending cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Auth APIs
export const authAPI = {
  // Get current user info
  async getCurrentUser(): Promise<User | null> {
    try {
      return await fetchWithCredentials(`${getApiUrl()}/api/user`)
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  },

  // Logout
  async logout(): Promise<void> {
    await fetchWithCredentials(`${getApiUrl()}/auth/logout`, { method: 'POST' })
  },
}

// Social Media Connection APIs
export const socialAPI = {
  // Get API URL for OAuth redirects
  getApiUrl() {
    return getApiUrl()
  },
  
  // Connect to Twitter
  connectTwitter() {
    window.location.href = `${getApiUrl()}/auth/twitter`
  },

  // Connect to Facebook (for Instagram)
  connectFacebook() {
    window.location.href = `${getApiUrl()}/auth/facebook`
  },

  // Unlink Twitter account
  async unlinkTwitter(): Promise<void> {
    await fetchWithCredentials(`${getApiUrl()}/api/unlink-twitter`, { method: 'POST' })
  },

  // Unlink Facebook account
  async unlinkFacebook(): Promise<void> {
    await fetchWithCredentials(`${getApiUrl()}/api/unlink-facebook`, { method: 'POST' })
  },

  // Connect to LinkedIn
  connectLinkedin() {
    window.location.href = `${getApiUrl()}/auth/linkedin`
  },

  // Unlink LinkedIn account
  async unlinkLinkedin(): Promise<void> {
    await fetchWithCredentials(`${getApiUrl()}/api/unlink-linkedin`, { method: 'POST' })
  },
}

// Content Generation APIs
export const generationAPI = {
  // Generate both image and caption using backend /api/generate-content
  async generateContent(params: {
    prompt: string
    platform?: string
    tone?: string
  }): Promise<GeneratedContent> {
    return await fetchWithCredentials(`${getApiUrl()}/api/generate-content`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },
}

// Posting APIs
export const postingAPI = {
  // Post generated content to selected platform
  async postGenerated(params: {
    platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin'
    caption: string
    image_base64?: string
    s3_url?: string
    postAsStory?: boolean
  }): Promise<{ success: boolean; postId?: string; permalink?: string; error?: string }> {
    return await fetchWithCredentials(`${getApiUrl()}/api/post-generated`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },
}

// Brand Profile APIs
export const brandAPI = {
  // Save brand profile
  async saveBrandProfile(profile: {
    organizationName: string
    shortDescription: string
    targetDemographics: string
    targetPsychographics: string
    marketingGoals: string
    plan?: string
  }): Promise<void> {
    await fetchWithCredentials(`${getApiUrl()}/api/brand-profile`, {
      method: 'POST',
      body: JSON.stringify(profile),
    })
  },

  // Get brand profile
  async getBrandProfile(): Promise<{
    organizationName: string
    shortDescription: string
    targetDemographics: string
    targetPsychographics: string
    marketingGoals: string
    plan?: string
  } | null> {
    try {
      return await fetchWithCredentials(`${getApiUrl()}/api/brand-profile`)
    } catch (error) {
      console.error('Failed to get brand profile:', error)
      return null
    }
  },
}

// Analytics APIs
export const analyticsAPI = {
  // Get analytics for a specific platform
  async getPlatformAnalytics(platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin'): Promise<any> {
    try {
      return await fetchWithCredentials(`${getApiUrl()}/api/analytics/${platform}`)
    } catch (error) {
      console.error(`Failed to get ${platform} analytics:`, error)
      return null
    }
  },
}

// Scheduled Posts APIs
export const scheduledPostsAPI = {
  // Create a scheduled post
  async createScheduledPost(params: {
    platforms: string[]
    caption: string
    imageUrl: string
    s3Url: string
    scheduledTime: string
  }): Promise<{ success: boolean; post: any }> {
    return await fetchWithCredentials(`${getApiUrl()}/api/scheduled-posts`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  // Get all scheduled posts
  async getScheduledPosts(startDate?: string, endDate?: string): Promise<{ posts: any[] }> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const url = `${getApiUrl()}/api/scheduled-posts${params.toString() ? '?' + params.toString() : ''}`
    return await fetchWithCredentials(url)
  },

  // Get scheduled posts for a specific month
  async getMonthlyScheduledPosts(year: number, month: number): Promise<{ posts: any[] }> {
    return await fetchWithCredentials(`${getApiUrl()}/api/scheduled-posts/month/${year}/${month}`)
  },

  // Delete a scheduled post
  async deleteScheduledPost(postId: string): Promise<{ success: boolean }> {
    return await fetchWithCredentials(`${getApiUrl()}/api/scheduled-posts/${postId}`, {
      method: 'DELETE',
    })
  },
}

// Usage tracking APIs
export const usageAPI = {
  // Get current usage stats
  async getUsage(): Promise<{
    plan: string
    used: number
    limit: number
    remaining: number
  }> {
    return await fetchWithCredentials(`${getApiUrl()}/api/usage`)
  },

  // Track a generation
  async trackGeneration(generationType: string = 'ai'): Promise<{ success: boolean }> {
    return await fetchWithCredentials(`${getApiUrl()}/api/track-generation`, {
      method: 'POST',
      body: JSON.stringify({ generationType }),
    })
  },
}

// Posts APIs
export const postsAPI = {
  // Get all user posts across all platforms
  async getAllPosts(limit?: number): Promise<{
    success: boolean
    posts: Array<{
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
    }>
    count: number
  }> {
    const url = limit ? `${getApiUrl()}/api/posts?limit=${limit}` : `${getApiUrl()}/api/posts`
    return await fetchWithCredentials(url)
  },
}
