# Stripe Connect Setup Guide

This guide will help you set up Stripe Connect for Nibbble.

## Prerequisites

1. A Stripe account (create one at https://stripe.com)
2. Stripe Connect enabled in your Stripe Dashboard

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_CONNECT_CLIENT_ID=ca_... # Your Stripe Connect client ID
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook endpoint secret

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Your app's base URL
```

## Getting Your Stripe Keys

### 1. Secret Key and Publishable Key
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click on "Developers" → "API keys"
3. Copy your "Publishable key" and "Secret key"

### 2. Connect Client ID
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click on "Connect" in the left sidebar
3. Copy your "Client ID" (starts with `ca_`)

### 3. Webhook Secret
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click on "Developers" → "Webhooks"
3. Click "Add endpoint"
4. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
5. Select these events:
   - `account.*`
   - `checkout.*`
   - `payment_intent.*`
   - `product.*`
6. Click "Add endpoint"
7. Copy the "Signing secret" (starts with `whsec_`)

## Testing the Integration

1. Start your development server: `npm run dev`
2. Go to `/stripe/connect` in your browser
3. Create a test connected account
4. Complete the onboarding process
5. Create products and test payments

## Test Cards

Use these test cards for payment testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## Features

- ✅ Create connected accounts
- ✅ Onboard users to accept payments
- ✅ Create and manage products
- ✅ Process payments with application fees
- ✅ Handle webhook events
- ✅ Account status monitoring
- ✅ Storefront for customers

## Troubleshooting

### Common Issues

1. **"STRIPE_SECRET_KEY is required"**
   - Make sure you've added the environment variable to `.env.local`
   - Restart your development server after adding environment variables

2. **"Account not found"**
   - Ensure the account ID is correct
   - Check if the account exists in your Stripe Dashboard

3. **Webhook verification failed**
   - Verify the webhook secret in your environment variables
   - Check the endpoint URL in your Stripe Dashboard

4. **Payment failed**
   - Ensure the account is properly onboarded
   - Check account capabilities and requirements

### Debug Mode

Enable debug logging by setting `debug: true` in the Stripe configuration.

## Production Deployment

1. Switch to live keys in your Stripe Dashboard
2. Update environment variables with live keys
3. Update webhook endpoint URL to your production domain
4. Test thoroughly before going live

## Support

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Dashboard](https://dashboard.stripe.com/)

## Next Steps

1. **Database Integration**: Store account and product data in your database
2. **User Authentication**: Integrate with your user management system
3. **Advanced Features**: Add subscription support, multi-currency, etc.
4. **Analytics**: Implement payment and product analytics
5. **Mobile Support**: Add mobile-optimized interfaces
