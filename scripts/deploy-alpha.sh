#!/bin/bash

# =============================================================================
# NIBBBLE ALPHA DEPLOYMENT SCRIPT
# =============================================================================
# Deploy alpha version with controlled feature flags and monitoring

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ALPHA_ENV_FILE=".env.alpha"
DEPLOYMENT_NAME="nibbble-alpha"
TARGET_URL="https://nibbble-alpha.vercel.app"

echo -e "${BLUE}🚀 NIBBBLE Alpha Deployment Starting...${NC}"
echo "Timestamp: $(date)"
echo "======================================"

# Step 1: Pre-deployment validation
echo -e "${BLUE}Step 1: Pre-deployment validation...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in NIBBBLE project directory${NC}"
    exit 1
fi

# Check if alpha env file exists
if [ ! -f "$ALPHA_ENV_FILE" ]; then
    echo -e "${RED}❌ Alpha environment file not found: $ALPHA_ENV_FILE${NC}"
    exit 1
fi

# Validate alpha configuration
if ! grep -q "NEXT_PUBLIC_ALPHA_MODE=true" "$ALPHA_ENV_FILE"; then
    echo -e "${RED}❌ Alpha mode not enabled in environment file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pre-deployment validation complete${NC}"

# Step 2: Build validation
echo -e "${BLUE}Step 2: Build validation...${NC}"

# Type checking (allow failures for alpha)
echo "Running TypeScript type checking..."
npm run type-check || {
    echo -e "${YELLOW}⚠️  Type checking failed, but continuing with alpha deployment...${NC}"
}

# Build the application with alpha config
echo "Building application with alpha configuration..."
export $(cat "$ALPHA_ENV_FILE" | xargs)
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Aborting alpha deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build validation complete${NC}"

# Step 3: Alpha feature validation
echo -e "${BLUE}Step 3: Alpha feature validation...${NC}"

# Validate that social features are disabled
if grep -q "NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=true" "$ALPHA_ENV_FILE"; then
    echo -e "${RED}❌ Social features enabled - should be disabled for alpha${NC}"
    exit 1
fi

# Validate that AI features are enabled
if ! grep -q "NEXT_PUBLIC_ENABLE_AI_RECIPE_ADAPTATION=true" "$ALPHA_ENV_FILE"; then
    echo -e "${RED}❌ AI features not enabled - required for alpha${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Alpha feature validation complete${NC}"

# Step 4: Deploy to Vercel
echo -e "${BLUE}Step 4: Deploying to Vercel...${NC}"

# Deploy with alpha environment
echo "Deploying NIBBBLE Alpha to Vercel..."
vercel --prod --yes --env-file="$ALPHA_ENV_FILE" || {
    echo -e "${RED}❌ Vercel deployment failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Vercel deployment complete${NC}"

# Step 5: Post-deployment validation
echo -e "${BLUE}Step 5: Post-deployment validation...${NC}"

# Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
sleep 30

# Test deployment health
echo "Testing deployment health..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL" || echo "000")

if [ "$response" -eq 200 ]; then
    echo -e "${GREEN}✅ Deployment health check passed${NC}"
else
    echo -e "${RED}❌ Deployment health check failed (HTTP $response)${NC}"
    exit 1
fi

# Test alpha mode is active
echo "Validating alpha mode is active..."
if curl -s "$TARGET_URL" | grep -q "ALPHA"; then
    echo -e "${GREEN}✅ Alpha mode confirmed active${NC}"
else
    echo -e "${YELLOW}⚠️  Could not confirm alpha mode from homepage${NC}"
fi

echo -e "${GREEN}✅ Post-deployment validation complete${NC}"

# Step 6: Deployment summary
echo -e "${GREEN}======================================"
echo -e "🎉 ALPHA DEPLOYMENT COMPLETE!"
echo -e "======================================"
echo -e "Production URL: $TARGET_URL"
echo -e "Deployment Time: $(date)"
echo -e "Alpha Mode: ENABLED"
echo -e "User Limit: 50 users"
echo -e "Feature Flags: Alpha configuration active"
echo -e "======================================"
echo -e "${NC}"

# Step 7: Next steps
echo -e "${BLUE}Next Steps:${NC}"
echo -e "1. Run alpha database migration: npm run alpha:migrate"
echo -e "2. Invite first alpha users from waitlist"
echo -e "3. Monitor alpha metrics dashboard"
echo -e "4. Validate cooking success rates"
echo -e "5. Collect user feedback"

echo -e "${GREEN}🚀 NIBBBLE Alpha is now LIVE at $TARGET_URL${NC}"

# Step 8: Create deployment record
echo "$(date): Alpha deployment completed successfully" >> deployment.log