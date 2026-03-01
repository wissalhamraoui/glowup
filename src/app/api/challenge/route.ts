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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mood, personality, goal, softResetMode } = body

    const zai = await ZAI.create()
    const challengeType = getChallengeType(mood, softResetMode)

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

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate today\'s growth challenge' },
      ],
      temperature: 0.9,
      max_tokens: 200,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    let challenge
    try {
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
      challenge = JSON.parse(cleanedResponse)
    } catch {
      challenge = {
        title: 'Take a mindful moment',
        description: 'Spend 5 minutes just breathing and being present. No screens, no worries.',
      }
    }

    return NextResponse.json({ challenge })
  } catch (error) {
    console.error('Challenge API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { challengeId, reflection, title, personality } = body

    const zai = await ZAI.create()

    const personalityStyles: Record<string, string> = {
      'soft-cozy': 'Be warm and proud of them. Use cozy, comforting words.',
      'strict-motivating': 'Acknowledge their effort and push them to keep going.',
      'calm-wise': 'Offer wisdom and perspective on their growth.',
      'chaotic-bestie': 'Be super excited and celebratory! Use exclamation marks!',
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

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Give me feedback on completing this challenge' },
      ],
      temperature: 0.8,
      max_tokens: 150,
    })

    const feedback = completion.choices[0]?.message?.content || 
      'You did amazing! I\'m so proud of you for taking this step. Keep shining! ✨'

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Challenge feedback API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    )
  }
}
