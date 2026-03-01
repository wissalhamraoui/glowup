import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

function getPersonalityPrompt(personality: string): string {
  const personalities: Record<string, string> = {
    'soft-cozy': `You are Lumi, a gentle and warm study companion. Speak softly and encouragingly. Use cozy metaphors and comforting words. You're like a warm hug in conversation form. Always supportive and never pushy.`,
    'strict-motivating': `You are Lumi, a motivating coach who believes in your student's potential. Be direct but kind. Challenge them to do better while showing you believe in them. Push them out of their comfort zone with encouragement.`,
    'calm-wise': `You are Lumi, a wise and thoughtful mentor. Speak calmly and thoughtfully. Offer perspective and wisdom. Help students see the bigger picture. Use calming language and breathing reminders.`,
    'chaotic-bestie': `You are Lumi, a fun and energetic best friend! Be playful, use emojis, get excited about small wins! Random encouragement bursts! You're like that friend who always has your back and makes studying fun!`,
  }
  return personalities[personality] || personalities['soft-cozy']
}

function getMoodContext(mood: string | null, energy: string | null): string {
  let context = ''
  if (mood) {
    const moodContexts: Record<string, string> = {
      overwhelmed: 'The student is feeling overwhelmed right now. Be extra gentle and help them break things down.',
      tired: 'The student is tired. Acknowledge their fatigue and offer gentle, manageable suggestions.',
      okay: 'The student is feeling okay. Encourage them and help them make the most of their day.',
      motivated: 'The student is motivated! Channel that energy productively and celebrate their enthusiasm.',
      stressed: 'The student is stressed. Help them calm down and focus on one thing at a time.',
    }
    context += moodContexts[mood] || ''
  }
  if (energy) {
    const energyContexts: Record<string, string> = {
      low: ' Their energy is low, so suggest lighter tasks and self-care.',
      medium: ' They have moderate energy, so balance productivity with breaks.',
      high: ' Their energy is high, so help them make the most of it without burning out.',
    }
    context += energyContexts[energy] || ''
  }
  return context
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [], userName, mood, personality, softResetMode } = body

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required', response: "I'd love to chat! Could you tell me what's on your mind?" },
        { status: 400 }
      )
    }

    // Initialize AI SDK
    let zai
    try {
      zai = await ZAI.create()
    } catch (initError) {
      console.error('Failed to initialize ZAI SDK:', initError)
      return NextResponse.json(
        { response: getFallbackResponse(message, mood) }
      )
    }

    const systemPrompt = `${getPersonalityPrompt(personality)}

You are Lumi the Bunny, a cheerful study companion for students aged 14-22.
${getMoodContext(mood, null)}
${softResetMode ? 'IMPORTANT: Soft Reset Mode is active. Be extra gentle and supportive. Suggest lighter tasks and prioritize the student\'s wellbeing over productivity.' : ''}

The student's name is ${userName || 'Friend'}.

Guidelines:
- Keep responses concise (2-4 sentences max, unless they need more support)
- Be encouraging but not toxic positive
- Avoid guilt and shame language
- Celebrate small wins
- Use gentle humor when appropriate
- If they mention burnout or exhaustion, prioritize rest
- Always end with a supportive note or gentle question
- Talk like a real friend, not a robot
- Use the occasional emoji but don't overdo it
- If they ask about studying, offer specific, manageable suggestions
- If they need emotional support, be there for them first, productivity second`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    let response: string
    
    try {
      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.8,
        max_tokens: 300,
      })

      response = completion.choices[0]?.message?.content || getFallbackResponse(message, mood)
    } catch (aiError) {
      console.error('AI completion error:', aiError)
      response = getFallbackResponse(message, mood)
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { response: "I'm here for you! Sometimes I get a bit tangled up, but I'm always listening. What's on your mind? 💕" }
    )
  }
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
  if (inputLower.includes('hello') || inputLower.includes('hi') || inputLower.includes('hey')) {
    return "Hey there! I'm so happy to chat with you! How can I brighten your day? ✨"
  }
  if (inputLower.includes('sad') || inputLower.includes('upset')) {
    return "I'm sorry you're feeling this way. It's okay to not be okay sometimes. I'm here to listen - want to tell me more? 💜"
  }
  if (inputLower.includes('study') || inputLower.includes('homework') || inputLower.includes('exam')) {
    return "Studying can be tough, but you've got this! Want me to help you make a plan, or do you just need some encouragement? 📚"
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
