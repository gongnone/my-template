import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Remove edge runtime
// export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { description } = await req.json();

    // Validate request body
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    console.log('Generating avatar for description:', description);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert in creating detailed customer avatars. Generate a comprehensive customer avatar based on the initial description. Return the data in this exact JSON format:
{
  "mainProblem": "detailed problem description",
  "currentFrustrations": "current frustrations with existing solutions",
  "urgencyLevel": "low|medium|high",
  "ageRange": "specific age range",
  "location": "specific location",
  "incomeLevel": "income range",
  "familyStatus": "family status",
  "mainGoals": "detailed goals",
  "immediateActionTriggers": "what would make them take action",
  "purchaseObjections": "main objections to purchasing",
  "informationSources": "where they seek information",
  "preferredContentFormat": "video|text|images|mixed",
  "peakEngagementTime": "when they're most active"
}`
        },
        {
          role: 'user',
          content: description,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse the JSON response
    try {
      const avatarData = JSON.parse(response.choices[0].message.content);
      console.log('Successfully generated avatar data');
      return NextResponse.json(avatarData);
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      return NextResponse.json(
        { error: 'Failed to parse avatar data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error generating avatar',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 