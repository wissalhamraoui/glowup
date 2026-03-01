'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type LumiMood = 'happy' | 'celebrating' | 'encouraging' | 'calm' | 'worried' | 'sleepy'

interface LumiMascotProps {
  mood?: LumiMood
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showShadow?: boolean
  animate?: boolean
}

export function LumiMascot({
  mood = 'happy',
  size = 'md',
  className,
  showShadow = true,
  animate = true,
}: LumiMascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  }

  const animationClass = animate ? getAnimationClass(mood) : ''
  const eyes = getEyes(mood)
  const mouth = getMouth(mood)
  const extras = getExtras(mood)

  return (
    <div
      className={cn(
        'relative',
        sizeClasses[size],
        animationClass,
        showShadow && 'lumi-shadow',
        className
      )}
    >
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Glow effect */}
        <defs>
          <radialGradient id="lumiGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD6E0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E2D1F9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF5F8" />
          </linearGradient>
          <linearGradient id="earGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE4EC" />
            <stop offset="100%" stopColor="#FFD6E0" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <circle cx="50" cy="70" r="45" fill="url(#lumiGlow)" className={animate ? 'animate-pulse-soft' : ''} />

        {/* Ears */}
        <ellipse cx="30" cy="25" rx="12" ry="25" fill="url(#earGradient)" stroke="#FFD6E0" strokeWidth="1" />
        <ellipse cx="70" cy="25" rx="12" ry="25" fill="url(#earGradient)" stroke="#FFD6E0" strokeWidth="1" />
        
        {/* Inner ears */}
        <ellipse cx="30" cy="28" rx="6" ry="15" fill="#FFB6C8" />
        <ellipse cx="70" cy="28" rx="6" ry="15" fill="#FFB6C8" />

        {/* Body */}
        <ellipse cx="50" cy="75" rx="35" ry="30" fill="url(#bodyGradient)" stroke="#FFD6E0" strokeWidth="1" />

        {/* Head */}
        <circle cx="50" cy="55" r="28" fill="url(#bodyGradient)" stroke="#FFD6E0" strokeWidth="1" />

        {/* Cheeks */}
        <ellipse cx="30" cy="60" rx="8" ry="5" fill="#FFD6E0" opacity="0.6" />
        <ellipse cx="70" cy="60" rx="8" ry="5" fill="#FFD6E0" opacity="0.6" />

        {/* Eyes */}
        {eyes}

        {/* Nose */}
        <ellipse cx="50" cy="62" rx="4" ry="3" fill="#FFB6C8" />

        {/* Mouth */}
        {mouth}

        {/* Extras (sparkles, hearts, etc.) */}
        {extras}

        {/* Arms/Paws */}
        <ellipse cx="25" cy="85" rx="8" ry="6" fill="url(#bodyGradient)" stroke="#FFD6E0" strokeWidth="1" />
        <ellipse cx="75" cy="85" rx="8" ry="6" fill="url(#bodyGradient)" stroke="#FFD6E0" strokeWidth="1" />

        {/* Tail */}
        <circle cx="50" cy="100" r="8" fill="url(#bodyGradient)" stroke="#FFD6E0" strokeWidth="1" />
      </svg>

      {/* Speech indicator for certain moods */}
      {(mood === 'encouraging' || mood === 'celebrating') && (
        <div className="absolute -right-2 -top-2 text-2xl animate-bounce-soft">
          {mood === 'celebrating' ? '✨' : '💫'}
        </div>
      )}
    </div>
  )
}

function getAnimationClass(mood: LumiMood): string {
  switch (mood) {
    case 'celebrating':
      return 'animate-celebrate'
    case 'encouraging':
      return 'animate-bounce-soft'
    case 'calm':
      return 'animate-float'
    case 'sleepy':
      return 'animate-pulse-soft'
    case 'worried':
      return 'animate-wiggle'
    default:
      return 'animate-float'
  }
}

function getEyes(mood: LumiMood) {
  switch (mood) {
    case 'happy':
      return (
        <>
          <path d="M 38 50 Q 42 46, 46 50" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 54 50 Q 58 46, 62 50" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )
    case 'celebrating':
      return (
        <>
          <path d="M 38 48 Q 42 44, 46 48" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 54 48 Q 58 44, 62 48" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Star eyes */}
          <text x="42" y="52" fontSize="8" fill="#FFD700">★</text>
          <text x="54" y="52" fontSize="8" fill="#FFD700">★</text>
        </>
      )
    case 'encouraging':
      return (
        <>
          <circle cx="42" cy="50" r="4" fill="#4A4A4A" />
          <circle cx="58" cy="50" r="4" fill="#4A4A4A" />
          <circle cx="43" cy="49" r="1.5" fill="white" />
          <circle cx="59" cy="49" r="1.5" fill="white" />
        </>
      )
    case 'calm':
      return (
        <>
          <path d="M 38 50 L 46 50" stroke="#4A4A4A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 54 50 L 62 50" stroke="#4A4A4A" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )
    case 'worried':
      return (
        <>
          <ellipse cx="42" cy="52" rx="3" ry="4" fill="#4A4A4A" />
          <ellipse cx="58" cy="52" rx="3" ry="4" fill="#4A4A4A" />
          <circle cx="43" cy="51" r="1" fill="white" />
          <circle cx="59" cy="51" r="1" fill="white" />
          {/* Worried eyebrows */}
          <path d="M 36 45 L 46 48" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 64 45 L 54 48" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )
    case 'sleepy':
      return (
        <>
          <path d="M 38 52 Q 42 54, 46 52" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 54 52 Q 58 54, 62 52" stroke="#4A4A4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )
    default:
      return (
        <>
          <circle cx="42" cy="50" r="3" fill="#4A4A4A" />
          <circle cx="58" cy="50" r="3" fill="#4A4A4A" />
        </>
      )
  }
}

function getMouth(mood: LumiMood) {
  switch (mood) {
    case 'happy':
      return <path d="M 44 68 Q 50 74, 56 68" stroke="#4A4A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
    case 'celebrating':
      return (
        <>
          <path d="M 42 66 Q 50 76, 58 66" stroke="#4A4A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 44 68 Q 50 74, 56 68" fill="#FFB6C8" />
        </>
      )
    case 'encouraging':
      return (
        <>
          <path d="M 44 68 Q 50 74, 56 68" stroke="#4A4A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 44 68 Q 50 72, 56 68" fill="#FFB6C8" />
        </>
      )
    case 'calm':
      return <path d="M 45 68 L 55 68" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
    case 'worried':
      return <path d="M 45 72 Q 50 68, 55 72" stroke="#4A4A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
    case 'sleepy':
      return <ellipse cx="50" cy="70" rx="4" ry="2" fill="#4A4A4A" />
    default:
      return <path d="M 45 68 Q 50 72, 55 68" stroke="#4A4A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
  }
}

function getExtras(mood: LumiMood) {
  switch (mood) {
    case 'celebrating':
      return (
        <>
          {/* Confetti/sparkles */}
          <text x="20" y="30" fontSize="10" className="animate-sparkle">✨</text>
          <text x="75" y="35" fontSize="8" className="animate-sparkle delay-200">✨</text>
          <text x="15" y="60" fontSize="6" className="animate-sparkle delay-300">⭐</text>
          <text x="80" y="55" fontSize="6" className="animate-sparkle delay-100">⭐</text>
        </>
      )
    case 'encouraging':
      return (
        <>
          {/* Hearts */}
          <text x="70" y="35" fontSize="10" className="animate-pulse-soft">💕</text>
        </>
      )
    case 'calm':
      return (
        <>
          {/* Zzz */}
          <text x="70" y="40" fontSize="8" className="animate-pulse-soft">💤</text>
        </>
      )
    case 'sleepy':
      return (
        <>
          {/* Multiple Zzz */}
          <text x="72" y="38" fontSize="6" className="animate-pulse-soft">z</text>
          <text x="76" y="32" fontSize="8" className="animate-pulse-soft delay-100">z</text>
          <text x="80" y="26" fontSize="10" className="animate-pulse-soft delay-200">z</text>
        </>
      )
    case 'worried':
      return (
        <>
          {/* Sweat drop */}
          <text x="68" y="42" fontSize="10">💦</text>
        </>
      )
    default:
      return null
  }
}

export default LumiMascot
