#!/bin/bash

# Deploy Frontend to Google Cloud Run
# Usage: ./deploy-frontend.sh [project-id] [service-name] [region] [backend-url]

set -e

PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME=${2:-"sticker-frontend"}
REGION=${3:-"us-central1"}
BACKEND_URL=${4:-""}

echo "🚀 Deploying frontend to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Build command for frontend
BUILD_CMD="npm run build"
if [ -n "$BACKEND_URL" ]; then
    echo "Setting backend URL: $BACKEND_URL"
    BUILD_CMD="$BUILD_CMD && echo 'Backend URL configured: $BACKEND_URL'"
fi

# Build and deploy
if [ -n "$BACKEND_URL" ]; then
    gcloud run deploy $SERVICE_NAME \
        --source ./frontend \
        --platform managed \
        --region $REGION \
        --project $PROJECT_ID \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --max-instances 10 \
        --set-build-env-vars="NODE_ENV=production,VITE_API_URL=$BACKEND_URL" \
        --set-env-vars="NODE_ENV=production"
else
    gcloud run deploy $SERVICE_NAME \
        --source ./frontend \
        --platform managed \
        --region $REGION \
        --project $PROJECT_ID \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --max-instances 10 \
        --set-build-env-vars="NODE_ENV=production" \
        --set-env-vars="NODE_ENV=production"
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --format "value(status.url)")

echo "✅ Frontend deployed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  Note: You'll need to configure the backend URL in your frontend code"
    echo "   Update the axios base URL in frontend/src/App.jsx to point to your backend service"
fi
