'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useApp, Goal, PersonalityVibe } from '@/context/AppContext'
import LumiMascot from './LumiMascot'

type OnboardingStep = 'welcome' | 'name' | 'goals' | 'personality' | 'complete'

const goals: { id: Goal; label: string; emoji: string; description: string }[] = [
  { id: 'school', label: 'School', emoji: '📚', description: 'Keep up with classes & homework' },
  { id: 'exams', label: 'Exams', emoji: '🎯', description: 'Ace upcoming tests & finals' },
  { id: 'language', label: 'Language Learning', emoji: '🌍', description: 'Master a new language' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡', description: 'Build better study habits' },
]

const personalities: { id: PersonalityVibe; label: string; emoji: string; description: string }[] = [
  { id: 'soft-cozy', label: 'Soft & Cozy', emoji: '🌷', description: 'Gentle encouragement, warm vibes' },
  { id: 'strict-motivating', label: 'Strict & Motivating', emoji: '🔥', description: 'Push me to do my best' },
  { id: 'calm-wise', label: 'Calm & Wise', emoji: '🌙', description: 'Thoughtful guidance, peaceful energy' },
  { id: 'chaotic-bestie', label: 'Chaotic Bestie', emoji: '💕', description: 'Fun, random, super supportive' },
]

export function OnboardingFlow() {
  const { setUser, setCurrentPhase, playSound } = useApp()
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [name, setName] = useState('')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityVibe | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)

  const handleComplete = () => {
    setUser({
      name: name || 'Friend',
      goal: selectedGoal,
      personalityVibe: selectedPersonality,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    })
    playSound('success')
    setShowAnimation(true)
    setTimeout(() => {
      setCurrentPhase('checkin')
    }, 2000)
  }

  const getLumiMood = () => {
    switch (step) {
      case 'welcome':
        return 'happy'
      case 'complete':
        return 'celebrating'
      default:
        return 'encouraging'
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep onNext={() => { playSound('button'); setStep('name') }} />
      case 'name':
        return <NameStep name={name} setName={setName} onNext={() => { playSound('button'); setStep('goals') }} />
      case 'goals':
        return (
          <GoalStep
            selectedGoal={selectedGoal}
            setSelectedGoal={(g) => { setSelectedGoal(g); playSound('toggle') }}
            onNext={() => { playSound('button'); setStep('personality') }}
          />
        )
      case 'personality':
        return (
          <PersonalityStep
            selectedPersonality={selectedPersonality}
            setSelectedPersonality={(p) => { setSelectedPersonality(p); playSound('toggle') }}
            onNext={handleComplete}
          />
        )
      case 'complete':
        return <CompleteStep name={name} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-glowup-gradient-soft stars-bg flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        {/* Lumi Mascot */}
        <div className="flex justify-center mb-6">
          <div className={cn(showAnimation && 'animate-celebrate')}>
            <LumiMascot mood={getLumiMood()} size="xl" />
          </div>
        </div>

        {/* Step Content */}
        <div
          className={cn(
            'glass rounded-3xl p-6 sm:p-8',
            'animate-fade-in-up'
          )}
        >
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-glowup-title">Hi, I'm Lumi!</h1>
        <p className="text-lg text-muted-foreground">
          Your cozy study companion 🌟
        </p>
      </div>
      <p className="text-foreground leading-relaxed">
        I'm here to help you study smarter, not harder. No stress, no guilt — 
        just gentle support and small wins!
      </p>
      <button onClick={onNext} className="btn-glowup w-full sm:w-auto">
        Let's Get Started ✨
      </button>
    </div>
  )
}

function NameStep({
  name,
  setName,
  onNext,
}: {
  name: string
  setName: (name: string) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">What should I call you?</h2>
        <p className="text-muted-foreground">I'll remember this for our chats!</p>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name or nickname..."
        className="input-glowup w-full text-center text-lg"
        maxLength={20}
        autoFocus
      />
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="btn-glowup"
          disabled={!name.trim()}
        >
          Continue 💫
        </button>
      </div>
    </div>
  )
}

function GoalStep({
  selectedGoal,
  setSelectedGoal,
  onNext,
}: {
  selectedGoal: Goal | null
  setSelectedGoal: (goal: Goal) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">What's your main focus?</h2>
        <p className="text-muted-foreground">Pick what matters most to you right now</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal.id)}
            className={cn(
              'mood-btn',
              selectedGoal === goal.id && 'mood-btn-selected'
            )}
          >
            <span className="text-3xl">{goal.emoji}</span>
            <span className="font-semibold">{goal.label}</span>
            <span className="text-xs text-muted-foreground">{goal.description}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="btn-glowup"
          disabled={!selectedGoal}
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}

function PersonalityStep({
  selectedPersonality,
  setSelectedPersonality,
  onNext,
}: {
  selectedPersonality: PersonalityVibe | null
  setSelectedPersonality: (personality: PersonalityVibe) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">How should I support you?</h2>
        <p className="text-muted-foreground">Choose the vibe that feels right</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {personalities.map((personality) => (
          <button
            key={personality.id}
            onClick={() => setSelectedPersonality(personality.id)}
            className={cn(
              'mood-btn',
              selectedPersonality === personality.id && 'mood-btn-selected'
            )}
          >
            <span className="text-3xl">{personality.emoji}</span>
            <span className="font-semibold">{personality.label}</span>
            <span className="text-xs text-muted-foreground">{personality.description}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="btn-glowup-accent"
          disabled={!selectedPersonality}
        >
          Start My Journey ✨
        </button>
      </div>
    </div>
  )
}

function CompleteStep({ name }: { name: string }) {
  return (
    <div className="text-center space-y-4 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-foreground">
        Welcome, {name || 'Friend'}! 🎉
      </h2>
      <p className="text-muted-foreground">
        I'm so excited to be your study buddy!
      </p>
      <div className="flex justify-center gap-2 text-3xl">
        <span className="animate-bounce-soft">✨</span>
        <span className="animate-bounce-soft delay-100">💕</span>
        <span className="animate-bounce-soft delay-200">🌟</span>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse-soft">
        Setting up your space...
      </p>
    </div>
  )
}

export default OnboardingFlow
