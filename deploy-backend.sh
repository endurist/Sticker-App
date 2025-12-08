#!/bin/bash

# Deploy Backend to Google Cloud Run
# Usage: ./deploy-backend.sh [project-id] [service-name] [region]

set -e

PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME=${2:-"sticker-backend"}
REGION=${3:-"us-central1"}

echo "🚀 Deploying backend to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Prompt for API keys if not provided as environment variables
if [ -z "$GOOGLE_API_KEY" ]; then
    echo ""
    echo "🔑 Please enter your Google AI Studio API key:"
    echo "(Get it from: https://aistudio.google.com/)"
    read -s GOOGLE_API_KEY
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo ""
    echo "🔑 Please enter your OpenAI API key:"
    echo "(Get it from: https://platform.openai.com/)"
    read -s OPENAI_API_KEY
fi

echo ""
echo "🔨 Building and deploying..."

# Build and deploy
gcloud run deploy $SERVICE_NAME \
    --source ./backend \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --port 8000 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars="GOOGLE_API_KEY=$GOOGLE_API_KEY,OPENAI_API_KEY=$OPENAI_API_KEY"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --format "value(status.url)")

echo "✅ Backend deployed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "⚠️  IMPORTANT: Update your frontend to use this backend URL:"
echo "   $SERVICE_URL/generate"
echo ""
echo "🔧 To update environment variables later:"
echo "   gcloud run services update $SERVICE_NAME \\"
echo "     --set-env-vars='GOOGLE_API_KEY=your_key,OPENAI_API_KEY=your_key' \\"
echo "     --region $REGION --project $PROJECT_ID"
