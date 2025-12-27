# Product Video Ad Generator

AI-powered platform for creating product video advertisements with automatic script generation, text-to-speech narration, and video composition.

## Features

- **AI Script Generation**: Automatically generates compelling ad scripts using AI
- **Text-to-Speech**: Converts scripts to professional voiceovers
- **Video Creation**: Generates beautiful video ads with animated text
- **Customizable**: Choose ad duration (15s, 30s, or 60s)
- **Download**: Export your video ads in WebM format

## Quick Start

```bash
npm install
npm run build
npm run dev
```

Visit http://localhost:3000

## Deployment

The app is configured to deploy to Vercel at: https://agentic-d7736ad3.vercel.app

To deploy, you need a VERCEL_TOKEN:

```bash
export VERCEL_TOKEN=your_token
npx vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-d7736ad3
```

Or get your token from: https://vercel.com/account/tokens

## Environment Variables

Create `.env.local`:

```
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: Works in demo mode without API key.

## Usage

1. Enter product name and description
2. Click "Generate Script" 
3. Review AI-generated script
4. Click "Create Video"
5. Download your video ad

## Tech Stack

- Next.js 14
- React + TypeScript
- TailwindCSS
- OpenAI API
- Canvas API
