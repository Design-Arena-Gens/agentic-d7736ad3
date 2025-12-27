import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-mode',
});

export async function POST(request: Request) {
  try {
    const { productName, productDescription, targetAudience, duration } = await request.json();

    // Demo mode fallback
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return NextResponse.json({
        script: generateDemoScript(productName, productDescription, duration),
        scenes: generateDemoScenes(productName, productDescription, duration),
      });
    }

    const prompt = `Create a compelling ${duration}-second video ad script for the following product:

Product Name: ${productName}
Description: ${productDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Requirements:
- The script should be engaging and persuasive
- Break it into 3-5 scenes for a video ad
- Each scene should be concise and impactful
- Include a strong call-to-action
- Format as clear, spoken narration

Provide:
1. Full script (narrative form)
2. JSON array of scenes with "text" and "duration" fields

Format your response as:
SCRIPT:
[full script here]

SCENES:
[JSON array here]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert advertising copywriter specializing in video ads.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content || '';
    const scriptMatch = response.match(/SCRIPT:\s*([\s\S]*?)(?=SCENES:|$)/);
    const scenesMatch = response.match(/SCENES:\s*(\[[\s\S]*\])/);

    const script = scriptMatch ? scriptMatch[1].trim() : response;
    let scenes = [];

    if (scenesMatch) {
      try {
        scenes = JSON.parse(scenesMatch[1]);
      } catch {
        scenes = generateDemoScenes(productName, productDescription, duration);
      }
    } else {
      scenes = generateDemoScenes(productName, productDescription, duration);
    }

    return NextResponse.json({ script, scenes });
  } catch (error) {
    console.error('Error generating script:', error);

    // Fallback to demo mode
    const { productName, productDescription, duration } = await request.json();
    return NextResponse.json({
      script: generateDemoScript(productName, productDescription, duration),
      scenes: generateDemoScenes(productName, productDescription, duration),
    });
  }
}

function generateDemoScript(productName: string, description: string, duration: number): string {
  if (duration <= 15) {
    return `Introducing ${productName}. ${description.slice(0, 100)}. Get yours today!`;
  } else if (duration <= 30) {
    return `Are you ready for something amazing? Introducing ${productName}. ${description.slice(0, 150)}. Don't miss out - order now and transform your life!`;
  } else {
    return `Imagine a product that changes everything. That's ${productName}. ${description.slice(0, 200)}. With cutting-edge features and unbeatable quality, ${productName} is the solution you've been waiting for. Join thousands of satisfied customers. Order today and experience the difference!`;
  }
}

function generateDemoScenes(productName: string, description: string, duration: number): any[] {
  const scenes = [];
  const sceneDuration = Math.floor(duration / 3);

  scenes.push({
    text: `Introducing ${productName}`,
    duration: sceneDuration,
  });

  scenes.push({
    text: description.slice(0, 100),
    duration: sceneDuration,
  });

  scenes.push({
    text: `Get ${productName} today!`,
    duration: duration - (sceneDuration * 2),
  });

  return scenes;
}
