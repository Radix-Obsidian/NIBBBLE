# Sentry CI/CD Setup Guide

This guide explains how to configure your CI/CD pipeline to automatically upload source maps to Sentry for better error tracking.

## 🔑 **Sentry Auth Token**

Your Sentry auth token is:
```
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
```

## 🚀 **Vercel Deployment (Recommended)**

### Option 1: Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `SENTRY_AUTH_TOKEN`
   - **Value**: `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`
   - **Environment**: Production, Preview, Development

### Option 2: Vercel CLI
```bash
vercel env add SENTRY_AUTH_TOKEN
# Paste the token when prompted
```

## 🔧 **GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with Sentry
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### GitHub Secrets Setup:
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:
   - `SENTRY_AUTH_TOKEN`: Your Sentry auth token
   - `VERCEL_TOKEN`: Your Vercel token
   - `ORG_ID`: Your Vercel organization ID
   - `PROJECT_ID`: Your Vercel project ID

## 🐳 **Docker Deployment**

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build with Sentry
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Build with:
```bash
docker build --build-arg SENTRY_AUTH_TOKEN=your_token_here -t nibbble-app .
```

## 🔍 **Verification**

After deployment, verify source maps are uploaded:

1. Go to your Sentry project dashboard
2. Navigate to **Settings** → **Source Maps**
3. Check that source maps are listed for your latest release
4. Test an error to verify stack traces show original source code

## 🛡️ **Security Notes**

- **Never commit** the auth token to your repository
- **Use environment variables** for all deployments
- **Rotate tokens** periodically for security
- **Limit token permissions** to only what's needed

## 📊 **Benefits**

With source maps uploaded:
- ✅ **Better stack traces** - See original TypeScript/JSX code
- ✅ **Faster debugging** - No need to guess minified code
- ✅ **Production debugging** - Debug issues in production easily
- ✅ **Better error grouping** - More accurate error categorization
