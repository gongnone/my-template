import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

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

    console.log('Generating product for description:', description);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert in creating detailed product descriptions. Generate a comprehensive product based on the initial description. Return the data in this exact JSON format:
{
  "name": "product name",
  "description": "detailed product description",
  "category": "product category",
  "targetMarket": "target market description",
  "painPoints": "detailed pain points",
  "uniqueSellingPoints": "unique selling points",
  "productFeatures": ["feature 1", "feature 2", "feature 3"],
  "methodology": "specific methodology/process/technology",
  "scientificStudies": "relevant research or studies",
  "featuredInPress": "press mentions",
  "credibilityMarkers": ["credibility marker 1", "credibility marker 2"],
  "uniqueMechanism": "unique mechanism or process",
  "answers": [
    {
      "question": "common question 1",
      "answer": "detailed answer 1"
    },
    {
      "question": "common question 2",
      "answer": "detailed answer 2"
    }
  ],
  "statistics": {
    "reviews": 100,
    "rating": 4.5,
    "totalCustomers": 1000
  },
  "testimonials": ["testimonial 1", "testimonial 2"]
}`
        },
        {
          role: 'user',
          content: description,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    if (!response.choices[0].message.content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse the JSON response
    try {
      const productData = JSON.parse(response.choices[0].message.content);
      console.log('Successfully generated product data');
      return NextResponse.json(productData);
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      return NextResponse.json(
        { error: 'Failed to parse product data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error generating product',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 