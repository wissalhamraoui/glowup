'use client'

import React, { useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'
import { AppProvider, useApp } from '@/context/AppContext'
import OnboardingFlow from '@/components/OnboardingFlow'
import DailyCheckIn from '@/components/DailyCheckIn'
import StudyPlanGenerator from '@/components/StudyPlanGenerator'
import GrowthChallenge from '@/components/GrowthChallenge'
import BurnoutMeter from '@/components/BurnoutMeter'
import ChatInterface from '@/components/ChatInterface'
import LumiMascot from '@/components/LumiMascot'
import MusicToggle, { SoundToggle } from '@/components/MusicToggle'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  MessageCircle, 
  Activity, 
  Menu, 
  X,
  Home as HomeIcon,
  LogOut
} from 'lucide-react'

function GlowUpApp() {
  const { 
    user, 
    currentPhase, 
    setCurrentPhase, 
    moodHistory,
    softResetMode,
    resetApp,
    playSound
  } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Use useSyncExternalStore to detect client-side rendering
  const isClient = useSyncExternalStore(
    () => () => {}, // no-op subscribe
    () => true, // client snapshot
    () => false // server snapshot
  )

  // Check if today's check-in is done
  const hasCheckedInToday = () => {
    if (moodHistory.length === 0) return false
    const lastCheckIn = new Date(moodHistory[moodHistory.length - 1].timestamp)
    const today = new Date()
    return lastCheckIn.toDateString() === today.toDateString()
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-glowup-gradient-soft flex items-center justify-center">
        <div className="animate-pulse-soft">
          <LumiMascot mood="calm" size="xl" />
        </div>
      </div>
    )
  }

  // Phase routing
  if (!user?.onboardingComplete) {
    return <OnboardingFlow />
  }

  if (currentPhase === 'checkin' || !hasCheckedInToday()) {
    return <DailyCheckIn />
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: HomeIcon },
    { id: 'study-plan', label: 'Study Plan', icon: BookOpen },
    { id: 'challenge', label: 'Challenge', icon: Target },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'burnout', label: 'Wellness', icon: Activity },
  ]

  const renderContent = () => {
    switch (currentPhase) {
      case 'study-plan':
        return (
          <div className="animate-fade-in-up">
            <StudyPlanGenerator />
          </div>
        )
      case 'challenge':
        return (
          <div className="animate-fade-in-up">
            <GrowthChallenge />
          </div>
        )
      case 'chat':
        return (
          <div className="animate-fade-in-up">
            <ChatInterface />
          </div>
        )
      case 'burnout':
        return (
          <div className="animate-fade-in-up">
            <BurnoutMeter />
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className={cn(
      'min-h-screen',
      softResetMode ? 'soft-reset-bg' : 'bg-glowup-gradient-soft'
    )}>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <LumiMascot mood="happy" size="sm" />
            <span className="font-bold text-glowup-title text-lg">GlowUp</span>
          </div>
          <MusicToggle />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-50',
          'glass border-r border-border',
          'transform transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <LumiMascot mood="happy" size="md" />
            <div>
              <h1 className="font-bold text-xl text-glowup-title">GlowUp</h1>
              <p className="text-xs text-muted-foreground">Study smarter ✨</p>
            </div>
          </div>

          {/* User greeting */}
          <div className="glass-pink rounded-xl p-3 mb-6">
            <p className="text-sm text-muted-foreground">Hello,</p>
            <p className="font-semibold text-foreground">{user.name || 'Friend'}!</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  playSound('button')
                  setCurrentPhase(item.id as typeof currentPhase)
                  setSidebarOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'transition-all duration-200',
                  currentPhase === item.id
                    ? 'bg-primary/30 text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex gap-2">
              <MusicToggle />
              <SoundToggle />
            </div>
            <button
              onClick={() => { playSound('click'); resetApp() }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Reset App</span>
            </button>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function Dashboard() {
  const { user, currentMood, currentEnergy, burnoutLevel, softResetMode, setCurrentPhase, studyPlan, challenges, playSound } = useApp()

  const completedChallenges = challenges.filter(c => c.completed).length
  const studyProgress = studyPlan 
    ? Math.round((studyPlan.tasks.filter(t => t.completed).length / studyPlan.tasks.length) * 100)
    : 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getMoodEmoji = () => {
    switch (currentMood) {
      case 'overwhelmed': return '😭'
      case 'tired': return '😴'
      case 'okay': return '🙂'
      case 'motivated': return '💪'
      case 'stressed': return '🤯'
      default: return '😊'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}, {user?.name || 'Friend'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {softResetMode 
              ? '🌿 Soft Reset Mode is active - taking it easy today'
              : 'Ready to make today amazing?'}
          </p>
        </div>
        <LumiMascot mood={currentMood === 'motivated' ? 'celebrating' : 'happy'} size="lg" />
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatusCard
          icon={getMoodEmoji()}
          label="Mood"
          value={currentMood || 'Not set'}
          onClick={() => { playSound('button'); setCurrentPhase('burnout') }}
        />
        <StatusCard
          icon="⚡"
          label="Energy"
          value={currentEnergy || 'Not set'}
          onClick={() => { playSound('button'); setCurrentPhase('burnout') }}
        />
        <StatusCard
          icon="🔥"
          label="Burnout"
          value={`${burnoutLevel}%`}
          warning={burnoutLevel >= 60}
          onClick={() => { playSound('button'); setCurrentPhase('burnout') }}
        />
        <StatusCard
          icon="⭐"
          label="Challenges"
          value={`${completedChallenges} done`}
          onClick={() => { playSound('button'); setCurrentPhase('challenge') }}
        />
      </div>

      {/* Quick actions */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionButton
            icon={BookOpen}
            label="Create Study Plan"
            description="Break down your goals into tasks"
            onClick={() => { playSound('button'); setCurrentPhase('study-plan') }}
            color="bg-primary/20"
          />
          <ActionButton
            icon={Target}
            label="Daily Challenge"
            description="Grow with small steps"
            onClick={() => { playSound('button'); setCurrentPhase('challenge') }}
            color="bg-accent/20"
          />
          <ActionButton
            icon={MessageCircle}
            label="Chat with Lumi"
            description="Get support and motivation"
            onClick={() => { playSound('button'); setCurrentPhase('chat') }}
            color="bg-secondary"
          />
          <ActionButton
            icon={Activity}
            label="Check Wellness"
            description="Track your burnout level"
            onClick={() => { playSound('button'); setCurrentPhase('burnout') }}
            color="bg-green-100"
          />
        </div>
      </div>

      {/* Active study plan */}
      {studyPlan && studyProgress < 100 && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Active Study Plan</h3>
            <span className="text-sm text-muted-foreground">{studyProgress}% complete</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full progress-glowup transition-all duration-500"
              style={{ width: `${studyProgress}%` }}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => { playSound('button'); setCurrentPhase('study-plan') }}
            className="w-full text-sm"
          >
            Continue studying →
          </Button>
        </div>
      )}

      {/* Lumi's tip */}
      <div className="chat-bubble chat-bubble-lumi">
        <p className="text-sm text-foreground">
          {softResetMode
            ? "Hey... today is about protecting your energy. I'm here with you. 💕"
            : burnoutLevel >= 60
            ? "I notice you might be feeling a lot. Want to chat or take a soft reset?"
            : "You're doing great! Small progress is still progress. ✨"}
        </p>
      </div>
    </div>
  )
}

function StatusCard({
  icon,
  label,
  value,
  warning,
  onClick,
}: {
  icon: string
  label: string
  value: string
  warning?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'glass rounded-xl p-3 text-left transition-all hover:shadow-md',
        warning && 'border-2 border-orange-300'
      )}
    >
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('font-semibold capitalize text-sm', warning && 'text-orange-600')}>
        {value}
      </p>
    </button>
  )
}

function ActionButton({
  icon: Icon,
  label,
  description,
  onClick,
  color,
}: {
  icon: React.ElementType
  label: string
  description: string
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl text-left',
        'transition-all hover:shadow-md hover:scale-[1.02]',
        'active:scale-[0.98]',
        color
      )}
    >
      <Icon className="w-5 h-5 mt-0.5 text-foreground/70" />
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <GlowUpApp />
    </AppProvider>
  )
}
