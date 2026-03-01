'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'
import { Volume2, VolumeX, Music, Bell, BellOff } from 'lucide-react'

export function MusicToggle() {
  const { musicEnabled, toggleMusic, playSound } = useApp()

  const handleClick = () => {
    playSound('toggle')
    toggleMusic()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300',
        musicEnabled
          ? 'bg-primary/30 text-primary-foreground shadow-md'
          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
      )}
      title={musicEnabled ? 'Turn off music' : 'Turn on music'}
    >
      {musicEnabled ? (
        <>
          <Volume2 className="w-4 h-4" />
          <Music className="w-3 h-3 animate-pulse" />
        </>
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </button>
  )
}

export function SoundToggle() {
  const { soundEnabled, toggleSound, playSound } = useApp()

  const handleClick = () => {
    // Play toggle sound before toggling (if sound is enabled)
    if (soundEnabled) {
      playSound('toggle')
    }
    toggleSound()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300',
        soundEnabled
          ? 'bg-accent/30 text-accent-foreground shadow-md'
          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
      )}
      title={soundEnabled ? 'Turn off sounds' : 'Turn on sounds'}
    >
      {soundEnabled ? (
        <>
          <Bell className="w-4 h-4" />
        </>
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      <span className="text-xs font-medium">Sounds</span>
    </button>
  )
}

export default MusicToggle
