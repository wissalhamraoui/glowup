'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useApp, Mood, Energy } from '@/context/AppContext'
import LumiMascot from './LumiMascot'

const moods: { id: Mood; emoji: string; label: string }[] = [
  { id: 'overwhelmed', emoji: '😭', label: 'Overwhelmed' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'okay', emoji: '🙂', label: 'Okay' },
  { id: 'motivated', emoji: '💪', label: 'Motivated' },
  { id: 'stressed', emoji: '🤯', label: 'Stressed' },
]

const energyLevels: { id: Energy; emoji: string; label: string; color: string }[] = [
  { id: 'low', emoji: '🔋', label: 'Low', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'medium', emoji: '🔋', label: 'Medium', color: 'bg-blue-100 border-blue-300' },
  { id: 'high', emoji: '🔋', label: 'High', color: 'bg-green-100 border-green-300' },
]

type CheckInStep = 'mood' | 'energy' | 'message'

export function DailyCheckIn() {
  const { user, addMoodEntry, setCurrentPhase, updateBurnoutLevel, softResetMode, playSound } = useApp()
  const [step, setStep] = useState<CheckInStep>('mood')
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [selectedEnergy, setSelectedEnergy] = useState<Energy | null>(null)
  const [showTransition, setShowTransition] = useState(false)

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    playSound('toggle')
    setTimeout(() => setStep('energy'), 300)
  }

  const handleEnergySelect = (energy: Energy) => {
    setSelectedEnergy(energy)
    playSound('toggle')
    setTimeout(() => setStep('message'), 300)
  }

  const handleComplete = () => {
    if (selectedMood && selectedEnergy) {
      addMoodEntry(selectedMood, selectedEnergy)
      updateBurnoutLevel()
      playSound('chime')
      setShowTransition(true)
      setTimeout(() => {
        setCurrentPhase('dashboard')
      }, 1500)
    }
  }

  const getLumiMood = () => {
    if (selectedMood === 'overwhelmed' || selectedMood === 'stressed') return 'worried'
    if (selectedMood === 'tired') return 'calm'
    if (selectedMood === 'motivated') return 'celebrating'
    return 'encouraging'
  }

  const getMessage = () => {
    if (!selectedMood || !selectedEnergy) return ''

    const messages: Record<Mood, Record<Energy, string[]>> = {
      overwhelmed: {
        low: [
          "Hey, I see you're having a tough time. Let's take this one tiny step at a time.",
          "It's okay to feel this way. I'm here with you. We go slow today.",
        ],
        medium: [
          "I hear you. Overwhelmed feelings are real, but so is your strength.",
          "Let's just focus on one thing today. Just one. I'll help you pick.",
        ],
        high: [
          "You've got energy but a lot on your plate. Let's channel it wisely.",
          "Even with the overwhelm, you showed up. That matters.",
        ],
      },
      tired: {
        low: [
          "Running on empty today? Let's be gentle with ourselves.",
          "Today is a rest day disguised as a study day. We protect your energy.",
        ],
        medium: [
          "Tired but showing up — that takes courage. Let's do something small.",
          "I'm proud of you for being here. Let's make today manageable.",
        ],
        high: [
          "Tired but still energized? You're resilient! Let's pace ourselves.",
          "You showed up tired. That's already a win in my book.",
        ],
      },
      okay: {
        low: [
          "Feeling okay with low energy? Let's keep things simple today.",
          "Steady and calm. Let's maintain this peaceful vibe.",
        ],
        medium: [
          "Okay is a good place to be! Let's make some gentle progress.",
          "Feeling balanced? Perfect time for some light studying.",
        ],
        high: [
          "Okay and energized? Great combo! Let's make today count.",
          "You're in a good spot! Ready for some productive vibes?",
        ],
      },
      motivated: {
        low: [
          "Mind is willing, body needs rest. That's a valid feeling!",
          "Motivated but low energy — let's do something small that matters.",
        ],
        medium: [
          "Motivated and steady! Let's channel this into something great.",
          "You're ready to go! I'll keep you on track without burning out.",
        ],
        high: [
          "YES! This is the energy! Let's make amazing things happen!",
          "You're on fire today! Let's ride this wave together!",
        ],
      },
      stressed: {
        low: [
          "Stressed and low energy... Let's just breathe together for a moment.",
          "Today we survive, not thrive. And that's perfectly okay.",
        ],
        medium: [
          "I feel that stress, but you're here. Let's tackle one thing.",
          "Stress is real, but so is your ability to handle it. One step at a time.",
        ],
        high: [
          "Stressed but energized — let's turn that into focused action.",
          "Channel that stress-energy into something productive. I've got you.",
        ],
      },
    }

    const moodMessages = messages[selectedMood][selectedEnergy]
    return moodMessages[Math.floor(Math.random() * moodMessages.length)]
  }

  const renderStep = () => {
    switch (step) {
      case 'mood':
        return (
          <MoodStep
            selectedMood={selectedMood}
            onSelect={handleMoodSelect}
            name={user?.name}
          />
        )
      case 'energy':
        return (
          <EnergyStep
            selectedEnergy={selectedEnergy}
            onSelect={handleEnergySelect}
            mood={selectedMood}
          />
        )
      case 'message':
        return (
          <MessageStep
            message={getMessage()}
            onComplete={handleComplete}
            softResetMode={softResetMode}
            playSound={playSound}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center p-4 sm:p-8',
        softResetMode ? 'soft-reset-bg' : 'bg-glowup-gradient-soft'
      )}
    >
      <div className="w-full max-w-lg">
        {/* Lumi Mascot */}
        <div className="flex justify-center mb-6">
          <LumiMascot mood={getLumiMood()} size="lg" />
        </div>

        {/* Check-in Card */}
        <div
          className={cn(
            'glass rounded-3xl p-6 sm:p-8',
            'animate-fade-in-up',
            showTransition && 'animate-celebrate'
          )}
        >
          {renderStep()}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {(['mood', 'energy', 'message'] as CheckInStep[]).map((s, i) => (
            <div
              key={s}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                step === s
                  ? 'bg-primary w-6'
                  : i < ['mood', 'energy', 'message'].indexOf(step)
                  ? 'bg-primary/60'
                  : 'bg-primary/20'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MoodStep({
  selectedMood,
  onSelect,
  name,
}: {
  selectedMood: Mood | null
  onSelect: (mood: Mood) => void
  name?: string
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Hey {name || 'there'}! How are you feeling?
        </h2>
        <p className="text-muted-foreground">No judgment — just check in with yourself</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={cn(
              'mood-btn py-3',
              selectedMood === mood.id && 'mood-btn-selected'
            )}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function EnergyStep({
  selectedEnergy,
  onSelect,
  mood,
}: {
  selectedEnergy: Energy | null
  onSelect: (energy: Energy) => void
  mood: Mood | null
}) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          How's your energy today?
        </h2>
        <p className="text-muted-foreground">
          {mood === 'motivated'
            ? "Even motivated days need pacing!"
            : "This helps me tailor your day"}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {energyLevels.map((energy) => (
          <button
            key={energy.id}
            onClick={() => onSelect(energy.id)}
            className={cn(
              'mood-btn flex-row justify-start gap-4 py-4',
              energy.color,
              selectedEnergy === energy.id && 'mood-btn-selected'
            )}
          >
            <span className="text-2xl">{energy.emoji}</span>
            <div className="text-left">
              <span className="font-semibold">{energy.label}</span>
              <p className="text-xs text-muted-foreground">
                {energy.id === 'low' && "Need to conserve energy today"}
                {energy.id === 'medium' && "Ready for some activity"}
                {energy.id === 'high' && "Feeling energized and ready"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageStep({
  message,
  onComplete,
  softResetMode,
  playSound,
}: {
  message: string
  onComplete: () => void
  softResetMode: boolean
  playSound: (type: string) => void
}) {
  const [showButton, setShowButton] = useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleClick = () => {
    playSound('button')
    onComplete()
  }

  return (
    <div className="space-y-6 text-center animate-fade-in-up">
      <div className="chat-bubble chat-bubble-lumi mx-auto">
        <p className="text-foreground leading-relaxed">{message}</p>
      </div>

      {softResetMode && (
        <div className="glass-pink rounded-xl p-4 text-sm text-foreground">
          <p className="font-medium">🌿 Soft Reset Mode Activated</p>
          <p className="text-muted-foreground text-xs mt-1">
            I've adjusted things to be gentler today.
          </p>
        </div>
      )}

      <div
        className={cn(
          'transition-all duration-500',
          showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        <button onClick={handleClick} className="btn-glowup">
          Let's Go ✨
        </button>
      </div>
    </div>
  )
}

export default DailyCheckIn
