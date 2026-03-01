'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { soundManager, SoundType } from '@/lib/sounds'

// Types
export type Goal = 'school' | 'exams' | 'language' | 'productivity'
export type PersonalityVibe = 'soft-cozy' | 'strict-motivating' | 'calm-wise' | 'chaotic-bestie'
export type Mood = 'overwhelmed' | 'tired' | 'okay' | 'motivated' | 'stressed'
export type Energy = 'low' | 'medium' | 'high'
export type AppPhase = 'onboarding' | 'checkin' | 'dashboard' | 'study-plan' | 'challenge' | 'chat'

export interface StudyTask {
  id: string
  title: string
  duration: number
  completed: boolean
  type: 'study' | 'break'
}

export interface StudyPlan {
  goal: string
  tasks: StudyTask[]
  createdAt: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  completed: boolean
  feedback?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface MoodEntry {
  mood: Mood
  energy: Energy
  timestamp: string
}

export interface UserProfile {
  name: string
  goal: Goal | null
  personalityVibe: PersonalityVibe | null
  onboardingComplete: boolean
  createdAt: string
}

export interface AppState {
  user: UserProfile | null
  currentPhase: AppPhase
  currentMood: Mood | null
  currentEnergy: Energy | null
  moodHistory: MoodEntry[]
  studyPlan: StudyPlan | null
  challenges: Challenge[]
  chatMessages: ChatMessage[]
  burnoutLevel: number
  softResetMode: boolean
  musicEnabled: boolean
  soundEnabled: boolean
}

interface AppContextType extends AppState {
  setUser: (user: UserProfile) => void
  setCurrentPhase: (phase: AppPhase) => void
  setCurrentMood: (mood: Mood) => void
  setCurrentEnergy: (energy: Energy) => void
  addMoodEntry: (mood: Mood, energy: Energy) => void
  setStudyPlan: (plan: StudyPlan) => void
  toggleTaskComplete: (taskId: string) => void
  addChallenge: (challenge: Challenge) => void
  completeChallenge: (challengeId: string, feedback: string) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  updateBurnoutLevel: () => void
  toggleSoftResetMode: () => void
  toggleMusic: () => void
  toggleSound: () => void
  playSound: (type: SoundType) => void
  resetApp: () => void
}

const defaultState: AppState = {
  user: null,
  currentPhase: 'onboarding',
  currentMood: null,
  currentEnergy: null,
  moodHistory: [],
  studyPlan: null,
  challenges: [],
  chatMessages: [],
  burnoutLevel: 0,
  softResetMode: false,
  musicEnabled: false,
  soundEnabled: true,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = 'glowup_app_state'

// Helper function to load state from localStorage (for lazy initialization)
function loadSavedState(): AppState {
  if (typeof window === 'undefined') return defaultState
  try {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      const parsed = JSON.parse(savedState)
      // Merge with default state to ensure all fields exist (handles migration when new fields are added)
      return { ...defaultState, ...parsed }
    }
  } catch (e) {
    console.error('Failed to parse saved state', e)
  }
  return defaultState
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization with a function - only runs once on mount
  const [state, setState] = useState<AppState>(loadSavedState)
  const isHydratedRef = useRef(false)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      isHydratedRef.current = true
    }
  }, [state])

  const setUser = useCallback((user: UserProfile) => {
    setState(prev => ({ ...prev, user }))
  }, [])

  const setCurrentPhase = useCallback((currentPhase: AppPhase) => {
    setState(prev => ({ ...prev, currentPhase }))
  }, [])

  const setCurrentMood = useCallback((currentMood: Mood) => {
    setState(prev => ({ ...prev, currentMood }))
  }, [])

  const setCurrentEnergy = useCallback((currentEnergy: Energy) => {
    setState(prev => ({ ...prev, currentEnergy }))
  }, [])

  const addMoodEntry = useCallback((mood: Mood, energy: Energy) => {
    const entry: MoodEntry = {
      mood,
      energy,
      timestamp: new Date().toISOString(),
    }
    setState(prev => ({
      ...prev,
      currentMood: mood,
      currentEnergy: energy,
      moodHistory: [...prev.moodHistory, entry],
    }))
  }, [])

  const setStudyPlan = useCallback((studyPlan: StudyPlan) => {
    setState(prev => ({ ...prev, studyPlan }))
  }, [])

  const toggleTaskComplete = useCallback((taskId: string) => {
    setState(prev => {
      if (!prev.studyPlan) return prev
      const tasks = prev.studyPlan.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
      return {
        ...prev,
        studyPlan: { ...prev.studyPlan, tasks },
      }
    })
  }, [])

  const addChallenge = useCallback((challenge: Challenge) => {
    setState(prev => ({
      ...prev,
      challenges: [...prev.challenges, challenge],
    }))
  }, [])

  const completeChallenge = useCallback((challengeId: string, feedback: string) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c =>
        c.id === challengeId ? { ...c, completed: true, feedback } : c
      ),
    }))
  }, [])

  const addChatMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, message],
    }))
  }, [])

  const clearChatMessages = useCallback(() => {
    setState(prev => ({ ...prev, chatMessages: [] }))
  }, [])

  const updateBurnoutLevel = useCallback(() => {
    setState(prev => {
      // Calculate burnout based on recent mood history
      const recentMoods = prev.moodHistory.slice(-7)
      if (recentMoods.length === 0) return { ...prev, burnoutLevel: 0 }

      let burnoutScore = 0
      recentMoods.forEach(entry => {
        switch (entry.mood) {
          case 'overwhelmed':
            burnoutScore += 25
            break
          case 'stressed':
            burnoutScore += 20
            break
          case 'tired':
            burnoutScore += 15
            break
          case 'okay':
            burnoutScore += 5
            break
          case 'motivated':
            burnoutScore -= 5
            break
        }
        if (entry.energy === 'low') burnoutScore += 10
        if (entry.energy === 'medium') burnoutScore += 5
      })

      // Normalize to 0-100
      const burnoutLevel = Math.min(100, Math.max(0, burnoutScore))
      const softResetMode = burnoutLevel >= 70

      return { ...prev, burnoutLevel, softResetMode }
    })
  }, [])

  const toggleSoftResetMode = useCallback(() => {
    setState(prev => ({ ...prev, softResetMode: !prev.softResetMode }))
  }, [])

  const toggleMusic = useCallback(() => {
    setState(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }))
  }, [])

  const toggleSound = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.soundEnabled
      soundManager.setEnabled(newEnabled)
      return { ...prev, soundEnabled: newEnabled }
    })
  }, [])

  const playSound = useCallback((type: SoundType) => {
    if (state.soundEnabled) {
      soundManager.play(type)
    }
  }, [state.soundEnabled])

  const resetApp = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState)
  }, [])

  const value: AppContextType = {
    ...state,
    setUser,
    setCurrentPhase,
    setCurrentMood,
    setCurrentEnergy,
    addMoodEntry,
    setStudyPlan,
    toggleTaskComplete,
    addChallenge,
    completeChallenge,
    addChatMessage,
    clearChatMessages,
    updateBurnoutLevel,
    toggleSoftResetMode,
    toggleMusic,
    toggleSound,
    playSound,
    resetApp,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
