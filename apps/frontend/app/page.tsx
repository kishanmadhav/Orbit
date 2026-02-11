'use client'

import { ChartBarIcon, CalendarIcon, CheckCircleIcon, SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    name: "AI-Powered Content",
    description: "Write captions and generate images in seconds. Our AI understands your brand voice and creates content that resonates with your audience.",
    icon: SparklesIcon,
  },
  {
    name: "Schedule & Publish",
    description: "Plan your week in minutes. Schedule posts across all your platforms from a single calendar — no more switching between apps.",
    icon: CalendarIcon,
  },
  {
    name: "Multi-Platform Support",
    description: "Connect Twitter, Instagram, and Facebook in one place. Write once, publish everywhere, and keep your brand consistent.",
    icon: CheckCircleIcon,
  },
  {
    name: "Track What Works",
    description: "See which posts drive engagement with clear, simple analytics. Understand your audience and double down on what works.",
    icon: ChartBarIcon,
  },
]

export default function LandingPage() {
  const handleLogin = () => {
    const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('agenticgenie.click')
      ? 'https://social-genie-backend.azurewebsites.net'
      : 'http://localhost:3000'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2.5 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SG</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">Social Genie</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleLogin} variant="ghost" className="text-slate-600 hover:text-slate-900 text-sm">
                Log in
              </Button>
              <Button onClick={handleLogin} size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="text-sm font-medium text-blue-600 mb-4 tracking-wide">
            by Agentic Genie
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Social media,{" "}
            <span className="text-blue-600">without the busywork.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create AI-generated posts, schedule them across platforms, and track performance — all from one simple dashboard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={handleLogin} size="lg" className="text-sm px-8">
              Start for free
              <ArrowRightIcon className="w-4 h-4 ml-1.5" />
            </Button>
            <Button asChild size="lg" variant="outline" className="text-sm">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-sm text-slate-500">
          <span>Works with <strong className="text-slate-700 font-medium">Twitter</strong>, <strong className="text-slate-700 font-medium">Instagram</strong> &amp; <strong className="text-slate-700 font-medium">Facebook</strong></span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span>Free tier available</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span>No credit card required</span>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3 tracking-tight">
              How it works
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Three steps to a consistent, stress-free social presence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Connect your accounts", desc: "Link your Twitter, Instagram, and Facebook profiles in under a minute." },
              { step: "02", title: "Create with AI", desc: "Describe what you want to post and let AI write the caption and generate the image." },
              { step: "03", title: "Schedule & track", desc: "Pick the best time, hit schedule, and monitor engagement from your dashboard." },
            ].map((item) => (
              <div key={item.step} className="text-center md:text-left">
                <div className="text-xs font-semibold text-blue-600 mb-3 tracking-widest">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-[15px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-28 bg-slate-50/70">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3 tracking-tight">
              Built for people who&apos;d rather be creating.
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Less time managing accounts. More time growing your brand.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map(({ name, description, icon: Icon }) => (
              <Card
                key={name}
                className="group border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-base text-slate-900">{name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[15px] text-slate-500 leading-relaxed">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-28 bg-white">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4 tracking-tight">
            Spend less time posting.{" "}
            <span className="text-blue-600">Start today.</span>
          </h2>
          <p className="text-lg text-slate-500 mb-8">
            Sign up in seconds with your Google account. No setup, no credit card.
          </p>
          <Button onClick={handleLogin} size="lg" className="text-sm px-8">
            Get Started Free
            <ArrowRightIcon className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">SG</span>
            </div>
            <span className="text-sm font-medium text-slate-700">Social Genie</span>
            <span className="text-xs text-slate-400">by Agentic Genie</span>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Social Genie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
