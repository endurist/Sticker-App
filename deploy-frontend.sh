#!/bin/bash

# Deploy Frontend to Google Cloud Run
# Usage: ./deploy-frontend.sh [project-id] [service-name] [region]

set -e

PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME=${2:-"sticker-frontend"}
REGION=${3:-"us-central1"}

echo "🚀 Deploying frontend to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Backend URL: https://sticker-backend-255707635938.us-central1.run.app (hardcoded)"

# Build and deploy
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

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --format "value(status.url)")

echo "✅ Frontend deployed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "🔗 Connected to backend: https://sticker-backend-255707635938.us-central1.run.app"
