import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

function getChallengeType(mood: string | null, softResetMode: boolean): string {
  if (softResetMode) {
    return 'self-care or very light growth activity'
  }
  
  switch (mood) {
    case 'overwhelmed':
    case 'stressed':
      return 'calming or stress-relief activity'
    case 'tired':
      return 'gentle energizing or rest activity'
    case 'motivated':
      return 'challenging growth activity'
    default:
      return 'balanced growth activity'
  }
}

function getPersonalityFlavor(personality: string): string {
  const flavors: Record<string, string> = {
    'soft-cozy': 'Make the challenge feel warm and achievable, like a cozy self-care moment.',
    'strict-motivating': 'Make the challenge slightly challenging but rewarding.',
    'calm-wise': 'Make the challenge thoughtful and reflective.',
    'chaotic-bestie': 'Make the challenge fun and unexpected!',
  }
  return flavors[personality] || flavors['soft-cozy']
}

function getFallbackChallenge(mood: string | null, softResetMode: boolean) {
  if (softResetMode) {
    return {
      title: 'Gentle self-care moment',
      description: 'Take 5 minutes to do something just for you - maybe stretch, listen to a favorite song, or just breathe.',
    }
  }
  
  switch (mood) {
    case 'overwhelmed':
    case 'stressed':
      return {
        title: 'Calming breath break',
        description: 'Take 5 minutes to practice deep breathing. Inhale for 4 counts, hold for 4, exhale for 4.',
      }
    case 'tired':
      return {
        title: 'Gentle energy boost',
        description: 'Step outside for 5 minutes of fresh air, or do some light stretching at your desk.',
      }
    case 'motivated':
      return {
        title: 'Power challenge',
        description: 'Tackle one task you\'ve been putting off. You\'ve got the energy - make it count!',
      }
    default:
      return {
        title: 'Take a mindful moment',
        description: 'Spend 5 minutes just breathing and being present. No screens, no worries.',
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mood, personality, goal, softResetMode } = body

    const challengeType = getChallengeType(mood, softResetMode)
    const fallbackChallenge = getFallbackChallenge(mood, softResetMode)

    // Initialize AI SDK
    let zai
    try {
      zai = await ZAI.create()
    } catch (initError) {
      console.error('Failed to initialize ZAI SDK:', initError)
      return NextResponse.json({ challenge: fallbackChallenge })
    }

    const systemPrompt = `You are a growth challenge generator for students aged 14-22.
Create a personalized daily challenge based on the student's current state.
${getPersonalityFlavor(personality)}
${softResetMode ? 'IMPORTANT: Soft Reset Mode is active. Create a very gentle, restorative challenge. Focus on self-care and small wins.' : ''}

The challenge should:
- Be achievable in 5-15 minutes
- Be related to ${challengeType}
- Connect to their goal of ${goal || 'personal growth'}
- Be specific and actionable
- Not feel like a chore

Respond with ONLY JSON, no markdown: {"title": "challenge title", "description": "brief description of what to do"}`

    let challenge

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate today\'s growth challenge' },
        ],
        temperature: 0.9,
        max_tokens: 200,
      })

      const responseText = completion.choices[0]?.message?.content || '{}'
      
      try {
        const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
        challenge = JSON.parse(cleanedResponse)
      } catch {
        challenge = fallbackChallenge
      }
    } catch (aiError) {
      console.error('AI completion error:', aiError)
      challenge = fallbackChallenge
    }

    return NextResponse.json({ challenge })
  } catch (error) {
    console.error('Challenge API error:', error)
    return NextResponse.json({
      challenge: {
        title: 'Take a mindful moment',
        description: 'Spend 5 minutes just breathing and being present. No screens, no worries.',
      }
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, reflection, personality } = body

    const personalityStyles: Record<string, string> = {
      'soft-cozy': 'Be warm and proud of them. Use cozy, comforting words.',
      'strict-motivating': 'Acknowledge their effort and push them to keep going.',
      'calm-wise': 'Offer wisdom and perspective on their growth.',
      'chaotic-bestie': 'Be super excited and celebratory! Use exclamation marks!',
    }

    const fallbackFeedback = 'You did amazing! I\'m so proud of you for taking this step. Keep shining! ✨'

    // Initialize AI SDK
    let zai
    try {
      zai = await ZAI.create()
    } catch (initError) {
      console.error('Failed to initialize ZAI SDK:', initError)
      return NextResponse.json({ feedback: fallbackFeedback })
    }

    const systemPrompt = `You are Lumi, celebrating a student who completed a growth challenge.
${personalityStyles[personality] || personalityStyles['soft-cozy']}

The student completed: "${title}"
Their reflection: "${reflection}"

Provide encouraging feedback (2-3 sentences) that:
- Celebrates their win
- Acknowledges their reflection
- Encourages them to keep going
- Feels genuine and warm

Respond with plain text, no JSON, no markdown.`

    let feedback: string

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Give me feedback on completing this challenge' },
        ],
        temperature: 0.8,
        max_tokens: 150,
      })

      feedback = completion.choices[0]?.message?.content || fallbackFeedback
    } catch (aiError) {
      console.error('AI completion error:', aiError)
      feedback = fallbackFeedback
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Challenge feedback API error:', error)
    return NextResponse.json({
      feedback: 'You did amazing! I\'m so proud of you for taking this step. Keep shining! ✨'
    })
  }
}
