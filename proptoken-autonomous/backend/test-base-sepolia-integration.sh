#!/bin/bash

# Test Mock SPV End-to-End Flow with Base Sepolia Integration
# This script submits a mock SPV, waits for verification, and checks the activity feed for BaseScan links

echo "🧪 Testing Mock SPV Flow with Base Sepolia Integration..."
echo ""

# Backend URL
BACKEND_URL="http://localhost:3001/graphql"

# Step 1: Submit Mock SPV
echo "📝 Step 1: Submitting Mock SPV..."
RESPONSE=$(curl -s -X POST $BACKEND_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { submitMockSPV(input: { spvName: \"Test Mock Property SPV\", location: { address: \"123 Mock Street\", city: \"Mock City\", state: \"Test State\", country: \"Testland\", coordinates: { lat: 40.7128, lng: -74.0060 } }, category: \"TEST\", financials: { valuation: 1000000, expectedReturn: 12.5 } }) { id status message } }"
  }')

echo "Response: $RESPONSE"

# Extract submission ID
SUBMISSION_ID=$(echo $RESPONSE | grep -oP '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SUBMISSION_ID" ]; then
  echo "❌ Failed to submit mock SPV"
  exit 1
fi

echo "✅ Mock SPV submitted with ID: $SUBMISSION_ID"
echo ""

# Step 2: Wait for verification
echo "⏳ Step 2: Waiting for verification (30 seconds)..."
sleep 30

# Step 3: Check activity feed
echo "📊 Step 3: Checking activity feed for BaseScan links..."
ACTIVITY_RESPONSE=$(curl -s -X POST $BACKEND_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getActivityFeed(limit: 10) { id type message timestamp explorerUrl metadata } }"
  }')

echo "Activity Feed Response:"
echo $ACTIVITY_RESPONSE | jq '.'

# Check for ASSET_REGISTERED event
if echo $ACTIVITY_RESPONSE | grep -q "ASSET_REGISTERED"; then
  echo ""
  echo "✅ ASSET_REGISTERED event found!"
  
  # Extract BaseScan URL
  BASESCAN_URL=$(echo $ACTIVITY_RESPONSE | grep -oP 'https://sepolia.basescan.org/tx/[^"]*' | head -1)
  
  if [ -n "$BASESCAN_URL" ]; then
    echo "🔗 BaseScan Transaction: $BASESCAN_URL"
    echo ""
    echo "🎉 SUCCESS! Mock SPV flow completed with Base Sepolia integration!"
  else
    echo "⚠️  ASSET_REGISTERED event found but no BaseScan URL"
  fi
else
  echo ""
  echo "⚠️  ASSET_REGISTERED event not found yet. Check logs for errors."
fi

echo ""
echo "📋 Summary:"
echo "- Submission ID: $SUBMISSION_ID"
echo "- Check full activity feed at: http://localhost:3001/graphql"
echo "- Query: { getActivityFeed(limit: 20) { type message explorerUrl } }"
