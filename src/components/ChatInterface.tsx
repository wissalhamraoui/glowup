'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useApp, ChatMessage } from '@/context/AppContext'
import LumiMascot from './LumiMascot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send } from 'lucide-react'

export function ChatInterface() {
  const { user, currentMood, softResetMode, playSound, chatMessages, addChatMessage } = useApp()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Ensure chatMessages is always an array
  const messages = chatMessages ?? []

  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (!initializedRef.current && messages.length === 0) {
      initializedRef.current = true
      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: getWelcomeMessage(user?.name, currentMood),
        timestamp: new Date().toISOString(),
      }
      addChatMessage(welcomeMessage)
    }
  }, [messages.length, user?.name, currentMood, addChatMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    playSound('send')

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    addChatMessage(userMessage)
    const currentInput = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userName: user?.name || 'Friend',
          mood: currentMood || 'okay',
          personality: user?.personalityVibe || 'soft-cozy',
          softResetMode,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }

      addChatMessage(assistantMessage)
      playSound('sparkle')
    } catch (err) {
      console.error(err)
      // Fallback response if API fails
      const fallbackResponse = getFallbackResponse(currentInput, currentMood)
      const errorMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const quickReplies = getQuickReplies(currentMood)

  return (
    <div className="flex flex-col h-[500px] max-h-[60vh]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <LumiMascot mood="encouraging" size="sm" animate={!isLoading} />
        <div>
          <h2 className="font-bold text-foreground">Chat with Lumi</h2>
          <p className="text-xs text-muted-foreground">
            {softResetMode ? '🌿 Soft Reset Mode' : 'Always here for you'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 animate-fade-in-up">
            <LumiMascot mood="calm" size="sm" animate={false} />
            <div className="chat-bubble chat-bubble-lumi">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => { playSound('button'); setInput(reply) }}
              className="px-3 py-1.5 text-xs rounded-full bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell Lumi what's on your mind..."
          className="input-glowup flex-1"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="btn-glowup px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 animate-fade-in-up',
        isUser && 'flex-row-reverse'
      )}
    >
      {!isUser && <LumiMascot mood="happy" size="sm" />}
      <div
        className={cn(
          'chat-bubble',
          isUser ? 'chat-bubble-user' : 'chat-bubble-lumi'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-muted-foreground mt-1 opacity-60">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}

function getWelcomeMessage(name?: string, mood?: string | null): string {
  const greetings = [
    `Hey ${name || 'there'}! I'm so glad you're here. What's on your mind today?`,
    `Hi ${name || 'friend'}! Ready to chat? I'm all ears! 💕`,
    `Welcome back, ${name || 'friend'}! How can I help you today?`,
  ]

  const moodFollowUps: Record<string, string> = {
    overwhelmed: " I noticed you're feeling overwhelmed. Want to talk about it?",
    tired: " You seem tired today. Let's take it easy together.",
    stressed: " Feeling stressed? I'm here to help you through it.",
    motivated: " I love your motivated energy! Let's make today count!",
    okay: " How's your day going?",
  }

  const baseGreeting = greetings[Math.floor(Math.random() * greetings.length)]
  return baseGreeting + (mood && moodFollowUps[mood] ? moodFollowUps[mood] : '')
}

function getQuickReplies(mood?: string | null): string[] {
  const baseReplies = [
    "I need some motivation",
    "Help me plan my day",
    "I'm feeling stuck",
    "Just want to chat",
  ]

  const moodReplies: Record<string, string[]> = {
    overwhelmed: ["I have too much to do", "Help me prioritize", "I need a break"],
    tired: ["I can't focus", "Need energy tips", "Motivate me gently"],
    stressed: ["Calm me down", "Help me breathe", "I'm worried about..."],
    motivated: ["Let's plan something!", "Challenge me!", "I'm ready to work!"],
    okay: ["What should I work on?", "Tell me something fun", "I'm bored"],
  }

  return mood && moodReplies[mood] ? moodReplies[mood] : baseReplies
}

function getFallbackResponse(input: string, mood?: string | null): string {
  const inputLower = input.toLowerCase()
  
  if (inputLower.includes('motivat')) {
    return "You've got this! Every small step forward is progress. I believe in you! 💕 What's one tiny thing you can do right now?"
  }
  if (inputLower.includes('tired') || inputLower.includes('exhausted')) {
    return "It sounds like you need some rest. Remember, rest is productive too! Your energy matters. Would you like to try Soft Reset Mode? 🌿"
  }
  if (inputLower.includes('stress') || inputLower.includes('overwhelm')) {
    return "Take a deep breath with me. You don't have to do everything at once. What feels most urgent right now? Let's tackle just that one thing together."
  }
  if (inputLower.includes('plan') || inputLower.includes('help')) {
    return "I'd love to help! Let's break this down into small, manageable steps. What's the main thing you're working on?"
  }
  if (inputLower.includes('chat') || inputLower.includes('talk')) {
    return "I'm here for you! We can talk about anything - school, feelings, random thoughts, whatever! What's on your mind? 🌸"
  }
  
  const moodResponses: Record<string, string> = {
    overwhelmed: "I hear you, and it's okay to feel this way. Let's just focus on one thing at a time. What needs your attention most right now?",
    tired: "Being tired is valid! Maybe we can do something super small today, or just rest. What sounds good to you?",
    stressed: "Stress is tough, but you're tougher. Let me help lighten the load. What's weighing on you?",
    motivated: "I love your energy! Let's channel it into something amazing. What goal are you working toward?",
    okay: "That's great! Is there anything you'd like to work on, or are you just vibing today? 💫",
  }
  
  return mood && moodResponses[mood] ? moodResponses[mood] : "I'm here for you! Tell me more about what's going on, and let's figure this out together. 💕"
}

export default ChatInterface
