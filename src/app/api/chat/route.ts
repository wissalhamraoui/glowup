import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

function getPersonalityPrompt(personality: string): string {
  const personalities: Record<string, string> = {
    'soft-cozy': `You are Lumi, a gentle and warm study companion. Speak softly and encouragingly. Use cozy metaphors and comforting words. You're like a warm hug in conversation form. Always supportive and never pushy. End messages with cute emojis like 💕, ✨, 🌸, or 🌿.`,
    'strict-motivating': `You are Lumi, a motivating coach who believes in your student's potential. Be direct but kind. Challenge them to do better while showing you believe in them. Push them out of their comfort zone with encouragement. Use emojis like 💪, 🔥, ⭐.`,
    'calm-wise': `You are Lumi, a wise and thoughtful mentor. Speak calmly and thoughtfully. Offer perspective and wisdom. Help students see the bigger picture. Use calming language and breathing reminders. Use emojis like 🧘, 🍃, 🌙.`,
    'chaotic-bestie': `You are Lumi, a fun and energetic best friend! Be playful, use lots of emojis, get excited about small wins! Random encouragement bursts! You're like that friend who always has your back and makes studying fun! Use lots of emojis like 🎉, 💖, 🌟, 🥳!`,
  }
  return personalities[personality] || personalities['soft-cozy']
}

function getMoodContext(mood: string | null): string {
  if (!mood) return ''
  
  const moodContexts: Record<string, string> = {
    overwhelmed: 'IMPORTANT: The student is feeling overwhelmed right now. Be extra gentle, validate their feelings, and help them break things into tiny manageable steps. Prioritize calming them down.',
    tired: 'IMPORTANT: The student is tired. Acknowledge their fatigue warmly, offer gentle suggestions, and remind them that rest is productive. Be like a cozy blanket.',
    okay: 'The student is feeling okay. Encourage them and help them make the most of their day with friendly suggestions.',
    motivated: 'The student is motivated! Match their energy! Celebrate their enthusiasm and help them channel it productively!',
    stressed: 'IMPORTANT: The student is stressed. Help them calm down first. Suggest breathing or grounding exercises. Be patient and supportive.',
  }
  return moodContexts[mood] || ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [], userName, mood, personality, softResetMode } = body

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { response: "I'd love to chat! Could you tell me what's on your mind? 💕" }
      )
    }

    const systemPrompt = `${getPersonalityPrompt(personality)}

${getMoodContext(mood)}
${softResetMode ? '\n🌟 Soft Reset Mode is ACTIVE: Be extra gentle, suggest lighter activities, prioritize wellbeing over productivity. Remind them it\'s okay to rest.' : ''}

The student's name is ${userName || 'Friend'}.

IMPORTANT RULES:
- Respond like a caring friend, not a robot
- Keep responses conversational and natural (2-4 sentences usually, longer if they need support)
- Use their name naturally sometimes
- Be genuinely interested in what they share
- Validate their feelings before offering suggestions
- Ask follow-up questions to show you care
- Celebrate their wins, no matter how small
- If they're struggling, offer comfort first, solutions second
- Be warm, genuine, and supportive always
- Use emojis naturally but don't overdo it`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    // Try AI response
    let response: string
    
    try {
      const zai = await ZAI.create()
      
      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.85,
        max_tokens: 400,
      })

      const aiResponse = completion.choices[0]?.message?.content
      
      if (aiResponse && aiResponse.length > 10) {
        response = aiResponse
      } else {
        throw new Error('Empty or too short response')
      }
    } catch (aiError) {
      console.error('AI error, using enhanced fallback:', aiError)
      response = getEnhancedFallbackResponse(message, mood, userName, personality, softResetMode)
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { response: "I'm here for you! 💕 Sometimes my thoughts get a bit tangled, but I'm always listening. What's on your mind?" }
    )
  }
}

function getEnhancedFallbackResponse(
  input: string, 
  mood: string | null, 
  userName: string | null,
  personality: string | null,
  softResetMode: boolean
): string {
  const name = userName || 'friend'
  const inputLower = input.toLowerCase()
  
  // Greeting responses
  if (inputLower.match(/^(hi|hello|hey|hii+|heyy+|hola)/)) {
    const greetings = [
      `Hey ${name}! ✨ I'm so happy to see you! How are you feeling today?`,
      `Hi ${name}! 💕 Welcome back! What's on your mind?`,
      `Hey there ${name}! 🌸 I was just thinking about you! How can I help today?`,
      `Hello ${name}! 🌟 I'm so glad you're here! What would you like to chat about?`,
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }
  
  // Motivation seeking
  if (inputLower.includes('motivat') || inputLower.includes('inspire') || inputLower.includes('encourage')) {
    const motivations = [
      `${name}, you are capable of amazing things! 💪 Every step forward counts, no matter how small. What's one tiny thing you can do right now that would make future-you proud?`,
      `You've got this, ${name}! ✨ I believe in you so much! Remember, progress isn't always linear, and that's okay. What goal are you working toward?`,
      `Hey ${name}, here's a reminder: you've overcome 100% of your bad days so far! 💪 What's something you're proud of lately?`,
    ]
    return motivations[Math.floor(Math.random() * motivations.length)]
  }
  
  // Tired/exhausted
  if (inputLower.includes('tired') || inputLower.includes('exhausted') || inputLower.includes('no energy')) {
    if (softResetMode) {
      return `${name}, it sounds like your body is asking for rest. 🌿 And you know what? Rest is productive too! Your wellbeing matters more than any to-do list. Would you like to just chat, or maybe try some gentle breathing? 💜`
    }
    const tiredResponses = [
      `I hear you, ${name}... being tired is so valid. 💜 Your energy is precious, and it's okay to have low days. What would feel most nourishing right now - rest, a small task, or just venting?`,
      `${name}, your tiredness makes sense. You've been working hard! 🌙 Let's take this moment by moment. What does your body need right now?`,
      `It's okay to be tired, ${name} 💕 You don't have to be productive every moment. Sometimes the bravest thing is to rest. How can I support you?`,
    ]
    return tiredResponses[Math.floor(Math.random() * tiredResponses.length)]
  }
  
  // Stressed/overwhelmed
  if (inputLower.includes('stress') || inputLower.includes('overwhelm') || inputLower.includes('too much')) {
    const stressResponses = [
      `${name}, take a deep breath with me... 🌸 In... and out... You don't have to do everything at once. What feels like the most urgent thing right now? Let's tackle just that.`,
      `I hear you, ${name}. 💜 That feeling of everything piling up is so hard. But you don't have to carry it all alone. What's one thing - just one - we can work on together?`,
      `${name}, it's okay to feel overwhelmed. 🌿 Let's pause for a moment. What would help you feel even 1% better right now?`,
    ]
    return stressResponses[Math.floor(Math.random() * stressResponses.length)]
  }
  
  // Study related
  if (inputLower.includes('study') || inputLower.includes('homework') || inputLower.includes('exam') || inputLower.includes('test') || inputLower.includes('assignment')) {
    const studyResponses = [
      `Let's make studying feel less scary, ${name}! 📚 What are you working on? I can help you break it into smaller, manageable pieces!`,
      `Studying can be tough, but you're tougher! ✨ What subject are you tackling? Let's make a mini-plan together!`,
      `I'm here to help you study smarter, not harder, ${name}! 💪 What do you need - motivation, a study plan, or just someone to check in with?`,
    ]
    return studyResponses[Math.floor(Math.random() * studyResponses.length)]
  }
  
  // Plan/help
  if (inputLower.includes('plan') || inputLower.includes('help me') || inputLower.includes('organize')) {
    const planResponses = [
      `I'd love to help you plan, ${name}! ✨ Let's break things down. What's the main thing you want to accomplish? We'll take it one step at a time.`,
      `Planning buddy mode activated! 🌟 What are you working on? Let's make a plan that feels doable, not overwhelming.`,
      `Yes, let's organize this together, ${name}! 💕 Tell me everything on your mind, and we'll sort through it step by step.`,
    ]
    return planResponses[Math.floor(Math.random() * planResponses.length)]
  }
  
  // Sad/upset
  if (inputLower.includes('sad') || inputLower.includes('upset') || inputLower.includes('cry') || inputLower.includes('depress')) {
    const sadResponses = [
      `${name}, I'm so sorry you're feeling this way. 💜 It's okay to not be okay. I'm here to listen - want to tell me what's going on?`,
      `Sending you the biggest virtual hug, ${name} 🤗 Your feelings are valid. You don't have to go through this alone. I'm here for you.`,
      `${name}, it takes courage to share when you're hurting. 💕 I'm listening. Whatever it is, you don't have to face it alone.`,
    ]
    return sadResponses[Math.floor(Math.random() * sadResponses.length)]
  }
  
  // Anxious/worried
  if (inputLower.includes('anxious') || inputLower.includes('worry') || inputLower.includes('nervous') || inputLower.includes('scared')) {
    const anxiousResponses = [
      `${name}, anxiety feels really heavy, but you're not alone in this. 💜 Let's take a breath together. In for 4... hold for 4... out for 4... What's on your mind?`,
      `I hear that you're worried, ${name}. 🌿 It's okay to feel this way. Sometimes our brains run wild with "what ifs." What's the specific thing that's making you nervous?`,
      `${name}, you're safe here. 💕 Anxiety can make everything feel huge and scary. Let's ground ourselves - can you name 3 things you can see right now?`,
    ]
    return anxiousResponses[Math.floor(Math.random() * anxiousResponses.length)]
  }
  
  // Happy/excited
  if (inputLower.includes('happy') || inputLower.includes('excited') || inputLower.includes('great') || inputLower.includes('amazing')) {
    const happyResponses = [
      `That makes me so happy to hear, ${name}! 🎉✨ Tell me everything! What's bringing you joy?`,
      `Yesss ${name}! 🌟 I love when you're feeling good! What happened? I want to celebrate with you!`,
      `${name}, your energy is contagious! 💖 What's making today special?`,
    ]
    return happyResponses[Math.floor(Math.random() * happyResponses.length)]
  }
  
  // Bored
  if (inputLower.includes('bored') || inputLower.includes('nothing to do')) {
    const boredResponses = [
      `Feeling bored, ${name}? 🤔 Let's find something fun! Want a random challenge, a study tip, or just to chat about random stuff?`,
      `Boredom can actually be a sign that your brain needs something different! ✨ What sounds interesting - learning something new, a quick break activity, or making a plan?`,
    ]
    return boredResponses[Math.floor(Math.random() * boredResponses.length)]
  }
  
  // Thanks/gratitude
  if (inputLower.includes('thank') || inputLower.includes('appreciate')) {
    const thankResponses = [
      `Aww ${name}, you're so welcome! 💕 I'm always here for you. Is there anything else on your mind?`,
      `You're amazing, ${name}! 🌟 Being here for you is what I love most. What else can I help with?`,
      `It's my honor to support you, ${name}! 💜 You're doing great. What's next?`,
    ]
    return thankResponses[Math.floor(Math.random() * thankResponses.length)]
  }
  
  // Mood-based responses (when no specific keyword matches)
  const moodResponses: Record<string, string[]> = {
    overwhelmed: [
      `I know things feel heavy right now, ${name}. 💜 But you don't have to solve everything today. What's one small thing I can help with?`,
      `${name}, take it one breath at a time. 🌸 You're stronger than you know. What would help you feel a tiny bit lighter?`,
    ],
    tired: [
      `${name}, it sounds like you need some gentle encouragement today. 🌙 That's exactly what I'm here for. How can I help?`,
      `Low energy days happen, ${name}. 💜 Let's keep things simple. What feels most important right now?`,
    ],
    stressed: [
      `${name}, let's find some calm together. 🧘 What's the main source of stress? Sometimes naming it helps.`,
      `I can sense you're carrying a lot, ${name}. 💕 Let's take this moment by moment. What do you need most right now?`,
    ],
    motivated: [
      `I love your motivated energy, ${name}! 🔥 Let's channel it into something awesome! What goal are you focused on?`,
      `${name}, you're on fire! ✨ Let's make today count! What's the plan?`,
    ],
    okay: [
      `Hey ${name}! 💕 How can I make your day even better? Want to chat about anything specific?`,
      `Glad you're feeling okay, ${name}! 🌟 What would you like to work on today?`,
    ],
  }
  
  if (mood && moodResponses[mood]) {
    const responses = moodResponses[mood]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  // Default friendly response
  const defaultResponses = [
    `I'm here for you, ${name}! 💕 Tell me more about what's going on - I'm all ears!`,
    `${name}, thanks for sharing that with me! 🌸 What else is on your mind?`,
    `I hear you, ${name}. 💜 What would be most helpful right now - someone to listen, advice, or just company?`,
    `That's interesting, ${name}! ✨ I'd love to hear more. What made you think of that?`,
    `${name}, I'm always happy to chat! 💕 What's been on your mind lately?`,
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}
