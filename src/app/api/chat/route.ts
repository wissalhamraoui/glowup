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
    const { message, conversationHistory, userName, mood, energy, personality, softResetMode } = body

    const zai = await ZAI.create()

    const systemPrompt = `${getPersonalityPrompt(personality)}

You are Lumi the Bunny, a cheerful study companion for students aged 14-22.
${getMoodContext(mood, energy)}
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

    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.8,
      max_tokens: 300,
    })

    const response = completion.choices[0]?.message?.content || 
      "I'm here for you! Could you tell me more about what's on your mind?"

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
