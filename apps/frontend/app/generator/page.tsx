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
import { generationAPI, postingAPI } from '@/lib/api'
import Toast from '@/components/Toast'
import { 
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface GeneratedContent {
  prompt: string
  caption: string
  imageUrl?: string
  s3Url?: string
}

export default function Generator() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'instagram' | 'facebook'>('twitter')
  const [tone, setTone] = useState('professional')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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

  const platforms = [
    { id: 'twitter' as const, name: 'X (Twitter)', color: 'bg-slate-900', icon: 'X', connected: !!user?.twitterAccount },
    { id: 'instagram' as const, name: 'Instagram', color: 'bg-blue-500', icon: 'ig', connected: !!user?.facebookAccount?.instagram_accounts?.length },
    { id: 'facebook' as const, name: 'Facebook', color: 'bg-blue-600', icon: 'f', connected: !!user?.facebookAccount }
  ]

  const tones = [
    { id: 'professional', label: 'Professional' },
    { id: 'casual', label: 'Casual' },
    { id: 'excited', label: 'Excited' },
    { id: 'informative', label: 'Informative' }
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      // Generate both image and caption using backend AI
      const result = await generationAPI.generateContent({
        prompt: prompt,
        platform: platforms.find(p => p.id === selectedPlatform)?.name,
        tone: tone
      })
      
      setGeneratedContent({
        prompt: prompt,
        caption: result.caption,
        imageUrl: result.image_url,
        s3Url: result.s3_url
      })
      
      setToast({ message: 'Content generated successfully!', type: 'success' })
    } catch (error) {
      console.error('Generation failed:', error)
      setToast({ message: 'Failed to generate content. Please try again.', type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePostContent = async () => {
    if (!generatedContent) return
    
    const selectedPlatformData = platforms.find(p => p.id === selectedPlatform)
    if (!selectedPlatformData?.connected) {
      setToast({ message: `Please connect your ${selectedPlatformData?.name} account first`, type: 'error' })
      return
    }
    
    setIsPosting(true)
    
    try {
      await postingAPI.postGenerated({
        platform: selectedPlatform,
        caption: generatedContent.caption,
        s3_url: generatedContent.s3Url
      })
      
      setToast({ message: `Posted successfully to ${selectedPlatformData.name}!`, type: 'success' })
      setGeneratedContent(null)
      setPrompt('')
    } catch (error) {
      console.error('Posting failed:', error)
      setToast({ message: 'Failed to post content. Please try again.', type: 'error' })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 mb-1">AI Generator</h1>
                <p className="text-sm text-slate-500">Create engaging content with AI-powered generation</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Generator */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Input */}
              <Card className="border-slate-200 bg-white">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900">Generate Content</CardTitle>
                    <CardDescription>Describe your post and let AI handle the rest.</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Prompt Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-3">
                      What would you like to post about?
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Announce our new product launch with excitement and highlight key features..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 placeholder-slate-400 transition-all duration-200"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Be specific about your message, audience, and any key points to include.
                    </p>
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-3">
                      Select Platform
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {platforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setSelectedPlatform(platform.id)}
                          disabled={!platform.connected}
                          className={`flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedPlatform === platform.id
                              ? 'border-blue-500 bg-blue-50/50'
                              : platform.connected
                              ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              : 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center shadow-sm`}>
                            <span className="text-white text-xs font-bold">{platform.icon}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-700">{platform.name}</span>
                          {!platform.connected && (
                            <span className="text-xs text-red-500">Not connected</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-3">
                      Tone
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tones.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTone(t.id)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            tone === t.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full py-6"
                  >
                    {isGenerating ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        <span>Generate Content</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Result */}
              {generatedContent && (
                <Card className="border-slate-200 bg-white animate-fade-in">
                  <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      <h3 className="text-lg font-semibold text-slate-900">Generated Content</h3>
                    </div>
                    <button 
                      onClick={() => setGeneratedContent(null)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  {/* Image Preview */}
                  {generatedContent.imageUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden">
                      <img 
                        src={generatedContent.imageUrl} 
                        alt="Generated content" 
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Preview */}
                  <div className="bg-slate-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SG</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Your Brand</p>
                        <p className="text-xs text-slate-500">Just now</p>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{generatedContent.caption}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                      >
                        <ArrowPathIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>Regenerate</span>
                      </Button>
                    </div>
                    <Button 
                      onClick={handlePostContent}
                      disabled={isPosting}
                    >
                      {isPosting ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <span>Post Now</span>
                      )}
                    </Button>
                  </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Panel - Tips */}
            <div className="space-y-6">
              {/* Quick Tips */}
              <Card className="border-blue-100 bg-blue-50/60">
                <CardHeader className="flex flex-row items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base text-slate-900">Tips for Better Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Be specific about your target audience</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Mention key features or benefits to highlight</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Include any hashtags or keywords to use</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Specify the desired content length</span>
                  </li>
                  </ul>
                </CardContent>
              </Card>

              {/* AI Features */}
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900">Powered By</CardTitle>
                  <CardDescription>Modern AI for visuals and captions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-xs">AI</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Sora 2</p>
                      <p className="text-xs text-slate-600">Advanced image generation</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-xs">GPT</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">GPT-4o-mini</p>
                      <p className="text-xs text-slate-600">Natural caption generation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
