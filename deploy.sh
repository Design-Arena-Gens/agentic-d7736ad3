#!/bin/bash
if [ -z "$VERCEL_TOKEN" ]; then
    echo "VERCEL_TOKEN environment variable is not set."
    echo "Please provide your Vercel token to deploy."
    echo ""
    echo "Get your token from: https://vercel.com/account/tokens"
    echo ""
    echo "Then run: export VERCEL_TOKEN=your_token_here"
    echo "Or add it to the deployment command: VERCEL_TOKEN=your_token npx vercel deploy --prod --yes --token \$VERCEL_TOKEN --name agentic-d7736ad3"
    exit 1
fi

npx vercel deploy --prod --yes --token "$VERCEL_TOKEN" --name agentic-d7736ad3
