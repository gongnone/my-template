import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const prompt = `Based on this brand description: "${description}"

Please generate comprehensive brand guidelines with the following elements:
1. Company Name (if not provided in the description)
2. Brand Voice: Define the tone and style of communication
3. Brand Values: Core principles and beliefs
4. Target Audience: Detailed description of the ideal customer
5. Unique Selling Proposition: What makes this brand special
6. Brand Personality: Human characteristics of the brand
7. Color Scheme: Suggested color palette
8. Typography: Recommended font styles
9. Visual Style: Overall visual direction
10. Brand Story: Compelling narrative about the brand

Format the response as a JSON object with these exact keys:
{
  "companyName": "",
  "brandVoice": "",
  "brandValues": "",
  "targetAudience": "",
  "uniqueSellingProposition": "",
  "brandPersonality": "",
  "colorScheme": "",
  "typography": "",
  "visualStyle": "",
  "brandStory": ""
}`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional brand strategist and designer who helps companies develop their brand identity.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'gpt-4-turbo-preview',
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const brandingData = JSON.parse(response);

    return NextResponse.json(brandingData);
  } catch (error) {
    console.error('Error generating branding:', error);
    return NextResponse.json(
      { error: 'Failed to generate branding guidelines' },
      { status: 500 }
    );
  }
} 