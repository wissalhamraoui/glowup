'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useApp, Challenge } from '@/context/AppContext'
import LumiMascot from './LumiMascot'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, Trophy, Star, CheckCircle2 } from 'lucide-react'

export function GrowthChallenge() {
  const { user, challenges, addChallenge, completeChallenge, currentMood, softResetMode, playSound } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [reflection, setReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Helper function to check if date is today (defined before use)
  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Get today's challenge (most recent incomplete)
  const todayChallenge = challenges.find(c => !c.completed && isToday(c.createdAt))

  const generateChallenge = async () => {
    setIsLoading(true)
    playSound('button')
    try {
      const response = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: currentMood || 'okay',
          personality: user?.personalityVibe || 'soft-cozy',
          goal: user?.goal || 'productivity',
          softResetMode,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate challenge')

      const data = await response.json()
      const newChallenge: Challenge = {
        id: Date.now().toString(),
        title: data.challenge.title,
        description: data.challenge.description,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      addChallenge(newChallenge)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const submitReflection = async () => {
    if (!todayChallenge || !reflection.trim()) return

    playSound('button')
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/challenge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: todayChallenge.id,
          reflection: reflection.trim(),
          title: todayChallenge.title,
          personality: user?.personalityVibe || 'soft-cozy',
        }),
      })

      if (!response.ok) throw new Error('Failed to submit reflection')

      const data = await response.json()
      completeChallenge(todayChallenge.id, data.feedback)
      playSound('celebration')
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLumiMood = () => {
    if (showCelebration) return 'celebrating'
    if (todayChallenge?.completed) return 'happy'
    return 'encouraging'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={cn(showCelebration && 'animate-celebrate')}>
          <LumiMascot mood={getLumiMood()} size="md" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Daily Growth Challenge</h2>
          <p className="text-sm text-muted-foreground">
            Small steps, big growth!
          </p>
        </div>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-fade-in-up">
            <div className="text-6xl animate-bounce-soft">🎉</div>
          </div>
          <ConfettiBurst />
        </div>
      )}

      {/* Challenge content */}
      {!todayChallenge ? (
        <div className="text-center space-y-4 py-6">
          <div className="text-4xl animate-float">🌟</div>
          <p className="text-muted-foreground">No challenge for today yet!</p>
          <Button
            onClick={generateChallenge}
            disabled={isLoading}
            className="btn-glowup-accent"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Today's Challenge
              </>
            )}
          </Button>
        </div>
      ) : todayChallenge.completed ? (
        <div className="space-y-4 animate-fade-in-up">
          <div className="glass-pink rounded-xl p-6 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
            <h3 className="font-bold text-lg text-foreground mb-2">
              Challenge Complete! 🎊
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {todayChallenge.title}
            </p>
            {todayChallenge.feedback && (
              <div className="chat-bubble chat-bubble-lumi mx-auto">
                <p className="text-sm text-foreground">{todayChallenge.feedback}</p>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce-soft"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          {/* Challenge card */}
          <div className="glass rounded-xl p-5 border-2 border-primary/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{todayChallenge.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {todayChallenge.description}
                </p>
              </div>
            </div>
          </div>

          {/* Reflection input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              How did it go? Share your thoughts:
            </label>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="I tried this challenge and..."
              className="input-glowup min-h-24 resize-none"
            />
            <Button
              onClick={submitReflection}
              disabled={!reflection.trim() || isSubmitting}
              className="btn-glowup w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Challenge
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Challenge history */}
      {challenges.filter(c => c.completed).length > 0 && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">
            Completed challenges: {challenges.filter(c => c.completed).length}
          </p>
          <div className="flex flex-wrap gap-1">
            {challenges
              .filter(c => c.completed)
              .slice(-5)
              .map((c, i) => (
                <div
                  key={c.id}
                  className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center"
                  title={c.title}
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Soft Reset indicator */}
      {softResetMode && (
        <p className="text-center text-xs text-muted-foreground">
          🌿 Soft Reset: Challenge is gentle today
        </p>
      )}
    </div>
  )
}

function ConfettiBurst() {
  const colors = ['#FFD6E0', '#E2D1F9', '#F5EBE0', '#FFB6C8', '#C9B8E0']

  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 0.5}s`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
          }}
        />
      ))}
    </div>
  )
}

export default GrowthChallenge
