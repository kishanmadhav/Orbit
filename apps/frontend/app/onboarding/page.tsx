'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { brandAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function Onboarding() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    organizationName: '',
    shortDescription: '',
    targetDemographics: '',
    targetPsychographics: '',
    marketingGoals: '',
    plan: 'premium' // default to premium
  })

  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Load existing brand profile if available
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await brandAPI.getBrandProfile()
      if (profile) {
        setFormData({
          ...profile,
          plan: profile.plan || 'premium' // ensure plan is set
        })
        // Mark all filled fields as completed
        const completed = new Set<string>()
        Object.entries(profile).forEach(([key, value]) => {
          if (value && String(value).length >= 3) {
            completed.add(key)
          }
        })
        setCompletedFields(completed)
      }
    }
    
    if (user) {
      loadProfile()
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Mark field as completed if it has meaningful content
    const minLengths: Record<string, number> = {
      organizationName: 3,
      shortDescription: 20,
      targetDemographics: 15,
      targetPsychographics: 15,
      marketingGoals: 15
    }
    
    const isCompleted = value.length >= (minLengths[field] || 10)
    if (isCompleted) {
      setCompletedFields(prev => new Set([...prev, field]))
    } else {
      setCompletedFields(prev => {
        const updated = new Set(prev)
        updated.delete(field)
        return updated
      })
    }
  }

  const calculateProgress = () => {
    return (completedFields.size / 5) * 100
  }

  const getCharCount = (field: keyof typeof formData, max: number) => {
    const current = formData[field].length
    const remaining = max - current
    const isNearLimit = remaining <= 20
    return { current, remaining, isNearLimit }
  }

  const handleSaveAndContinue = async () => {
    if (completedFields.size < 3) {
      return
    }

    setSaving(true)
    try {
      await brandAPI.saveBrandProfile(formData)
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save brand profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-3">
              <span className="text-white font-bold text-xl">SG</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">Social Genie</span>
            <span className="text-xs text-slate-500 ml-2">a product by Agentic Genie</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 animate-fade-in">
            Welcome Aboard!
          </h1>
          <p className="text-xl text-slate-600">
            Let's set up your brand profile to start generating amazing content.
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Profile Completion</span>
              <span className="text-sm font-semibold text-blue-600">
                {completedFields.size}/5 fields
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Organization Details */}
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Organization Details</CardTitle>
                  <CardDescription>Tell us about your organization.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Organization Name
                  {completedFields.has('organizationName') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  onFocus={() => setFocusedField('organizationName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Acme Corporation"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 ${
                    focusedField === 'organizationName' ? 'shadow-md' : 'border-slate-200'
                  }`}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Short Description
                  {completedFields.has('shortDescription') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <textarea
                  rows={4}
                  maxLength={200}
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  onFocus={() => setFocusedField('shortDescription')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Describe your company's mission, products, or services..."
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none ${
                    focusedField === 'shortDescription' ? 'shadow-md' : 'border-slate-200'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-500">Brief overview of your brand</p>
                  <span className={`text-xs ${getCharCount('shortDescription', 200).isNearLimit ? 'text-orange-500' : 'text-slate-500'}`}>
                    {getCharCount('shortDescription', 200).remaining} characters left
                  </span>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Audience & Goals */}
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Audience & Goals</CardTitle>
                  <CardDescription>Define who you're talking to and what you want to achieve.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Audience Demographics
                  {completedFields.has('targetDemographics') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={formData.targetDemographics}
                  onChange={(e) => handleInputChange('targetDemographics', e.target.value)}
                  onFocus={() => setFocusedField('targetDemographics')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Millennials aged 25-40, urban professionals, middle to high income, tech-savvy"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none ${
                    focusedField === 'targetDemographics' ? 'shadow-md' : 'border-slate-200'
                  }`}
                />
                <span className={`text-xs ${getCharCount('targetDemographics', 150).isNearLimit ? 'text-orange-500' : 'text-slate-500'} float-right mt-1`}>
                  {getCharCount('targetDemographics', 150).remaining} left
                </span>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Audience Psychographics
                  {completedFields.has('targetPsychographics') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={formData.targetPsychographics}
                  onChange={(e) => handleInputChange('targetPsychographics', e.target.value)}
                  onFocus={() => setFocusedField('targetPsychographics')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Value sustainability, seek work-life balance, early adopters of new technology"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none ${
                    focusedField === 'targetPsychographics' ? 'shadow-md' : 'border-slate-200'
                  }`}
                />
                <span className={`text-xs ${getCharCount('targetPsychographics', 150).isNearLimit ? 'text-orange-500' : 'text-slate-500'} float-right mt-1`}>
                  {getCharCount('targetPsychographics', 150).remaining} left
                </span>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Marketing Goals & Motto
                  {completedFields.has('marketingGoals') && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-2 animate-scale-in" />
                  )}
                </label>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={formData.marketingGoals}
                  onChange={(e) => handleInputChange('marketingGoals', e.target.value)}
                  onFocus={() => setFocusedField('marketingGoals')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., Increase brand awareness by 30%, drive website traffic. 'Innovation for Everyone'"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none ${
                    focusedField === 'marketingGoals' ? 'shadow-md' : 'border-slate-200'
                  }`}
                />
                <span className={`text-xs ${getCharCount('marketingGoals', 150).isNearLimit ? 'text-orange-500' : 'text-slate-500'} float-right mt-1`}>
                  {getCharCount('marketingGoals', 150).remaining} left
                </span>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Choose Your Plan</CardTitle>
                  <CardDescription>Select the plan that best fits your content needs.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Standard Plan */}
              <button
                onClick={() => handleInputChange('plan', 'standard')}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.plan === 'standard'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {formData.plan === 'standard' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Standard</h3>
                <div className="text-3xl font-bold text-slate-900 mb-2">Free</div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Unlimited scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-slate-300">✗</span>
                    <span className="text-slate-400">No AI generations</span>
                  </li>
                </ul>
              </button>

              {/* Pro Plan */}
              <button
                onClick={() => handleInputChange('plan', 'pro')}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.plan === 'pro'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {formData.plan === 'pro' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Pro</h3>
                <div className="text-3xl font-bold text-slate-900 mb-2">$19<span className="text-base font-normal text-slate-600">/mo</span></div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Unlimited scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span><strong>30 AI generations</strong>/month</span>
                  </li>
                </ul>
              </button>

              {/* Premium Plan */}
              <button
                onClick={() => handleInputChange('plan', 'premium')}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.plan === 'premium'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  POPULAR
                </div>
                {formData.plan === 'premium' && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Premium</h3>
                <div className="text-3xl font-bold text-slate-900 mb-2">$39<span className="text-base font-normal text-slate-600">/mo</span></div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Unlimited scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span><strong>60 AI generations</strong>/month</span>
                  </li>
                </ul>
              </button>
            </div>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleSaveAndContinue}
              disabled={completedFields.size < 3 || saving}
              className="px-8 py-6 text-base shadow-sm"
            >
              {saving ? 'Saving...' : 'Continue Setup'}
              <span>→</span>
            </Button>
            <p className="text-sm text-slate-500 mt-4">
              {completedFields.size >= 3 ? 'Ready to continue!' : 'Fill at least 3 fields to continue'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
