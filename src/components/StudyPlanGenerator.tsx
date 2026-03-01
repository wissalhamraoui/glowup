'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useApp, StudyTask } from '@/context/AppContext'
import LumiMascot from './LumiMascot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, CheckCircle2, Circle, Clock, Coffee, Sparkles } from 'lucide-react'

interface StudyPlanGeneratorProps {
  onBack?: () => void
}

export function StudyPlanGenerator({ onBack }: StudyPlanGeneratorProps) {
  const { user, studyPlan, setStudyPlan, toggleTaskComplete, currentEnergy, softResetMode, playSound } = useApp()
  const [goal, setGoal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePlan = async () => {
    if (!goal.trim()) return

    setIsLoading(true)
    setError(null)
    playSound('button')

    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goal.trim(),
          energy: currentEnergy || 'medium',
          personality: user?.personalityVibe || 'soft-cozy',
          softResetMode,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

      const data = await response.json()
      setStudyPlan(data.plan)
      playSound('success')
    } catch (err) {
      setError('Oops! Something went wrong. Let\'s try again!')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const completedTasks = studyPlan?.tasks.filter(t => t.completed).length || 0
  const totalTasks = studyPlan?.tasks.length || 0
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const getLumiMood = () => {
    if (isLoading) return 'calm'
    if (progress === 100) return 'celebrating'
    if (progress > 50) return 'encouraging'
    return 'happy'
  }

  return (
    <div className="space-y-6">
      {/* Header with Lumi */}
      <div className="flex items-center gap-4">
        <LumiMascot mood={getLumiMood()} size="md" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Study Plan Generator</h2>
          <p className="text-sm text-muted-foreground">
            Tell me what you need to study, and I'll break it down!
          </p>
        </div>
      </div>

      {/* Goal Input */}
      {!studyPlan && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Math exam in 5 days, or Learn Spanish basics..."
              className="input-glowup flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleGeneratePlan()}
              disabled={isLoading}
            />
            <Button
              onClick={handleGeneratePlan}
              disabled={!goal.trim() || isLoading}
              className="btn-glowup"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Planning...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['Math exam', 'Essay due', 'Vocabulary practice', 'Chapter review'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => { playSound('button'); setGoal(suggestion) }}
                className="px-3 py-1.5 text-sm rounded-full bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generated Plan */}
      {studyPlan && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Goal display */}
          <div className="glass-pink rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Your goal:</p>
            <p className="font-semibold text-foreground">{studyPlan.goal}</p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full progress-glowup transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tasks list */}
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {studyPlan.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onToggle={() => {
                  toggleTaskComplete(task.id)
                  playSound(task.completed ? 'click' : 'pop')
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => { playSound('button'); setStudyPlan(null) }}
              className="rounded-full"
            >
              New Plan
            </Button>
            {progress === 100 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">All done! 🎉</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Soft Reset Mode indicator */}
      {softResetMode && (
        <div className="text-center text-sm text-muted-foreground">
          🌿 Soft Reset Mode: Tasks are lighter today
        </div>
      )}
    </div>
  )
}

function TaskCard({
  task,
  index,
  onToggle,
}: {
  task: StudyTask
  index: number
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'task-card flex items-center gap-3 cursor-pointer transition-all duration-300',
        task.completed && 'task-card-completed',
        'animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onToggle}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium transition-all',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.type === 'break' ? (
            <Coffee className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          <span>{task.duration} min</span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs',
            task.type === 'break' ? 'bg-accent/50' : 'bg-primary/50'
          )}>
            {task.type === 'break' ? 'Break' : 'Study'}
          </span>
        </div>
      </div>
      {task.completed ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <Circle className="w-5 h-5 text-muted-foreground/30" />
      )}
    </div>
  )
}

export default StudyPlanGenerator
