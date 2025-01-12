import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fetch from 'node-fetch';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY || 'YOUR_API_KEY'; // Replace with your key

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Use Browserless API to scrape the page
    const browserlessUrl = `https://chrome.browserless.io/content?token=${BROWSERLESS_API_KEY}`;
    const fetchResponse = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        waitFor: 'div[role="main"], div[role="article"]',
        elements: [
          {
            selector: 'div[role="main"]',
            timeout: 10000
          },
          {
            selector: 'div[role="article"]',
            timeout: 10000
          },
          {
            selector: '.xdj266r',
            timeout: 10000
          }
        ],
        gotoOptions: {
          waitUntil: 'networkidle0',
          timeout: 10000
        }
      })
    });

    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch page: ${fetchResponse.status} ${fetchResponse.statusText}`);
    }

    const content = await fetchResponse.json();
    
    if (!content || !content.data || content.data.length === 0) {
      throw new Error('No content found on page');
    }

    // Combine all extracted content
    const extractedText = content.data
      .map((item: any) => item.text || '')
      .join('\n')
      .trim();

    if (!extractedText) {
      throw new Error('No text content found on page');
    }

    // Use GPT to extract structured content
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing Facebook ads. Extract the following components from the provided content:
          
          - Headline: The main message or call to action (usually short and attention-grabbing)
          - Primary Text: The main body of the ad (longer, descriptive text)
          - Description: Any additional text, link description, or call-to-action
          - Ad Type: Determine if it's lead generation (collecting info/signups) or conversion (direct sales) focused
          - Industry: Determine the industry based on the content and terminology used
          
          Return the data in this exact JSON format:
          {
            "headline": "extracted headline",
            "primaryText": "extracted primary text",
            "description": "extracted description",
            "type": "lead-gen or conversion",
            "industry": "determined industry"
          }`
        },
        {
          role: 'user',
          content: `Analyze this Facebook ad content: ${extractedText}`
        }
      ],
      temperature: 0.3,
    });

    // Parse the JSON from the response
    try {
      const extractedContent = JSON.parse(gptResponse.choices[0].message.content || '{}');
      return NextResponse.json(extractedContent);
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      return NextResponse.json({ error: 'Failed to parse extracted content' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error scraping ad:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape ad content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 