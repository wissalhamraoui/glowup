'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import LumiMascot from './LumiMascot'
import { Button } from '@/components/ui/button'
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Heart, Moon, Sun, Zap } from 'lucide-react'

export function BurnoutMeter() {
  const { burnoutLevel, softResetMode, toggleSoftResetMode, moodHistory, currentMood, currentEnergy } = useApp()

  const getBurnoutStatus = () => {
    if (burnoutLevel >= 80) return { label: 'Critical', color: 'bg-red-400', emoji: '🚨', message: "Let's take a real break together." }
    if (burnoutLevel >= 60) return { label: 'High', color: 'bg-orange-400', emoji: '⚠️', message: "I'm worried about you. Let's slow down." }
    if (burnoutLevel >= 40) return { label: 'Moderate', color: 'bg-yellow-400', emoji: '🌤️', message: "You're doing okay, but let's be careful." }
    if (burnoutLevel >= 20) return { label: 'Low', color: 'bg-blue-400', emoji: '😊', message: "You're managing well!" }
    return { label: 'Great', color: 'bg-green-400', emoji: '✨', message: "You're thriving! Keep it up!" }
  }

  const status = getBurnoutStatus()

  const getEnergyIcon = () => {
    switch (currentEnergy) {
      case 'low':
        return <BatteryLow className="w-5 h-5 text-yellow-500" />
      case 'medium':
        return <BatteryMedium className="w-5 h-5 text-blue-500" />
      case 'high':
        return <BatteryFull className="w-5 h-5 text-green-500" />
      default:
        return <Battery className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getMoodEmoji = () => {
    switch (currentMood) {
      case 'overwhelmed':
        return '😭'
      case 'tired':
        return '😴'
      case 'okay':
        return '🙂'
      case 'motivated':
        return '💪'
      case 'stressed':
        return '🤯'
      default:
        return '😊'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <LumiMascot mood={burnoutLevel >= 60 ? 'worried' : burnoutLevel >= 40 ? 'calm' : 'happy'} size="md" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Burnout Meter</h2>
          <p className="text-sm text-muted-foreground">
            Tracking your wellness
          </p>
        </div>
      </div>

      {/* Main meter */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Burnout Level</span>
          <span className="text-lg font-bold">{burnoutLevel}%</span>
        </div>

        {/* Gradient progress bar */}
        <div className="relative h-6 rounded-full overflow-hidden bg-secondary">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-1000',
              status.color
            )}
            style={{ width: `${burnoutLevel}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-foreground/70 drop-shadow-sm">
              {status.emoji} {status.label}
            </span>
          </div>
        </div>

        {/* Lumi's message */}
        <div className="chat-bubble chat-bubble-lumi">
          <p className="text-sm text-foreground">{status.message}</p>
        </div>
      </div>

      {/* Current status cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            {getEnergyIcon()}
            <span className="text-sm font-medium">Energy</span>
          </div>
          <p className="text-lg font-bold capitalize">
            {currentEnergy || 'Not set'}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getMoodEmoji()}</span>
            <span className="text-sm font-medium">Mood</span>
          </div>
          <p className="text-lg font-bold capitalize">
            {currentMood || 'Not set'}
          </p>
        </div>
      </div>

      {/* Mood history mini-chart */}
      {moodHistory.length > 0 && (
        <div className="glass rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Mood Trend</h3>
          <div className="flex items-end gap-1 h-12">
            {moodHistory.slice(-7).map((entry, i) => {
              const height = entry.mood === 'motivated' ? 100 :
                            entry.mood === 'okay' ? 75 :
                            entry.mood === 'tired' ? 50 :
                            entry.mood === 'stressed' ? 35 : 20
              const color = entry.mood === 'motivated' ? 'bg-green-400' :
                           entry.mood === 'okay' ? 'bg-blue-400' :
                           entry.mood === 'tired' ? 'bg-yellow-400' :
                           entry.mood === 'stressed' ? 'bg-orange-400' : 'bg-red-400'
              return (
                <div
                  key={i}
                  className={cn('flex-1 rounded-t-sm transition-all', color)}
                  style={{ height: `${height}%` }}
                  title={`${entry.mood} - ${new Date(entry.timestamp).toLocaleDateString()}`}
                />
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Last {Math.min(moodHistory.length, 7)} check-ins
          </p>
        </div>
      )}

      {/* Soft Reset Mode */}
      <div className={cn(
        'rounded-xl p-4 border-2 transition-all',
        softResetMode ? 'bg-accent/30 border-accent' : 'bg-secondary/30 border-transparent'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className={cn('w-5 h-5', softResetMode ? 'text-purple-500' : 'text-muted-foreground')} />
            <div>
              <h3 className="font-semibold text-foreground">Soft Reset Mode</h3>
              <p className="text-xs text-muted-foreground">
                {softResetMode
                  ? 'Active - Gentler tasks & supportive messages'
                  : 'Reduce intensity when overwhelmed'}
              </p>
            </div>
          </div>
          <Button
            variant={softResetMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleSoftResetMode}
            className={cn(
              'rounded-full',
              softResetMode && 'bg-accent text-accent-foreground hover:bg-accent/80'
            )}
          >
            {softResetMode ? 'Active' : 'Enable'}
          </Button>
        </div>

        {softResetMode && (
          <div className="mt-3 pt-3 border-t border-accent/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>Reduced task difficulty</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Heart className="w-4 h-4" />
              <span>Extra supportive messages</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Sun className="w-4 h-4" />
              <span>Calming animations</span>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          💡 Tip: Regular check-ins help me understand you better
        </p>
      </div>
    </div>
  )
}

export default BurnoutMeter
