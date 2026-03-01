import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface StudyTask {
  id: string
  title: string
  duration: number
  completed: boolean
  type: 'study' | 'break'
}

function getPersonalityStyle(personality: string): string {
  const styles: Record<string, string> = {
    'soft-cozy': 'Be gentle and encouraging in task descriptions. Add little supportive notes.',
    'strict-motivating': 'Be direct and challenging. Push them to do more.',
    'calm-wise': 'Be thoughtful and balanced. Include reflection moments.',
    'chaotic-bestie': 'Be fun and random! Add enthusiasm to task names!',
  }
  return styles[personality] || styles['soft-cozy']
}

function adjustForEnergy(energy: string, softResetMode: boolean): { taskDuration: number; breakDuration: number; maxTasks: number } {
  if (softResetMode) {
    return { taskDuration: 15, breakDuration: 10, maxTasks: 4 }
  }
  
  switch (energy) {
    case 'low':
      return { taskDuration: 15, breakDuration: 10, maxTasks: 4 }
    case 'medium':
      return { taskDuration: 25, breakDuration: 5, maxTasks: 6 }
    case 'high':
      return { taskDuration: 30, breakDuration: 5, maxTasks: 8 }
    default:
      return { taskDuration: 25, breakDuration: 5, maxTasks: 6 }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { goal, energy, personality, softResetMode } = body

    const zai = await ZAI.create()
    const { taskDuration, breakDuration, maxTasks } = adjustForEnergy(energy, softResetMode)

    const systemPrompt = `You are a study plan generator for students. Create a micro-study plan based on the student's goal.
${getPersonalityStyle(personality)}
${softResetMode ? 'IMPORTANT: Soft Reset Mode is active. Create a very gentle, manageable plan. Fewer tasks, shorter durations, more breaks.' : ''}

Generate ${Math.min(maxTasks, 6)} tasks for the goal. Mix study tasks with break tasks.
- Study tasks should be ${taskDuration} minutes
- Break tasks should be ${breakDuration} minutes
- Break tasks should come after every 1-2 study tasks
- Each task should be specific and actionable

Respond with ONLY a JSON array of tasks, no markdown, no explanation.
Format: [{"title": "task name", "duration": number, "type": "study" or "break"}]`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a study plan for: ${goal}` },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseText = completion.choices[0]?.message?.content || '[]'
    
    // Parse the JSON response
    let tasks: Omit<StudyTask, 'id' | 'completed'>[] = []
    try {
      // Clean up the response if it has markdown code blocks
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
      tasks = JSON.parse(cleanedResponse)
    } catch {
      // Fallback tasks if parsing fails
      tasks = [
        { title: 'Review your materials', duration: taskDuration, type: 'study' },
        { title: 'Take a short break', duration: breakDuration, type: 'break' },
        { title: 'Practice with examples', duration: taskDuration, type: 'study' },
        { title: 'Stretch and hydrate', duration: breakDuration, type: 'break' },
      ]
    }

    // Ensure we have valid tasks
    const validTasks: StudyTask[] = tasks.slice(0, maxTasks).map((task, index) => ({
      id: `task-${Date.now()}-${index}`,
      title: task.title || `Task ${index + 1}`,
      duration: task.duration || taskDuration,
      completed: false,
      type: task.type || 'study',
    }))

    return NextResponse.json({
      plan: {
        goal,
        tasks: validTasks,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Study plan API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate study plan' },
      { status: 500 }
    )
  }
}
