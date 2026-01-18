#!/bin/bash

# Configuration
URL="http://localhost:3001/graphql"
CONTENT_TYPE="Content-Type: application/json"

echo "🚀 Starting End-to-End Mock SPV Test..."
echo "Target: $URL"

# 1. Submit Mock SPV
echo -e "\n📝 1. Submitting Mock SPV..."
SUBMIT_QUERY='mutation { submitMockSPV(name: "Test SPV", address: "123 Mock St", longitude: 77.5, latitude: 12.9) { submissionId status abmScore satImageUrl nextStep } }'
RESPONSE=$(curl -s -X POST -H "$CONTENT_TYPE" -d "{\"query\": \"$SUBMIT_QUERY\"}" $URL)
echo "Response: $RESPONSE"

# Extract ID (simple parsing for bash, ideally use jq)
ID=$(echo $RESPONSE | grep -o '"submissionId":"[^"]*' | cut -d'"' -f4)

if [ -z "$ID" ]; then
  echo "❌ Failed to submit SPV."
  exit 1
fi
echo "✅ SPV Submitted with ID: $ID"

# 2. Wait for Verification & Minting (Async process in backend)
echo -e "\n⏳ 2. Waiting for Verification & Token Minting (5s)..."
sleep 5

# 3. Check Activity Feed
echo -e "\n📡 3. Checking Activity Feed..."
FEED_QUERY='query { getActivityFeed(limit: 5) { events { type message explorerUrl } } }'
FEED_RESPONSE=$(curl -s -X POST -H "$CONTENT_TYPE" -d "{\"query\": \"$FEED_QUERY\"}" $URL)
echo "Feed: $FEED_RESPONSE"

# 4. Verify Token Minting
if [[ $FEED_RESPONSE == *"TOKEN_DEPLOYED"* ]]; then
    echo -e "\n✅ Success! Token deployment detected in activity feed."
    echo "🎉 End-to-End Flow Complete!"
else
    echo -e "\n⚠️ Token deployment not yet confirmed in feed. Check backend logs."
fi
