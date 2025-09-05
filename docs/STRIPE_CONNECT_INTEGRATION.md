# Stripe Connect Integration Guide

This guide explains the complete Stripe Connect integration for Nibbble, including account creation, onboarding, product management, and payment processing.

## Overview

The Stripe Connect integration allows Nibbble to:
- Create connected accounts for users
- Onboard users to accept payments
- Manage products on connected accounts
- Process payments with application fees
- Handle webhook events

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Nibbble App   │    │  Stripe Connect  │    │  Connected      │
│                 │    │                  │    │  Accounts       │
│ - Dashboard     │◄──►│ - Account Mgmt   │◄──►│ - Products      │
│ - Storefronts   │    │ - Onboarding     │    │ - Payments      │
│ - Checkout      │    │ - Webhooks       │    │ - Payouts       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

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

## API Routes

### Account Management

#### Create Connected Account
```http
POST /api/stripe/connect/accounts
Content-Type: application/json

{
  "email": "user@example.com",
  "country": "US"
}
```

#### Get Account Status
```http
GET /api/stripe/connect/accounts/[accountId]
```

#### Create Onboarding Link
```http
POST /api/stripe/connect/onboarding
Content-Type: application/json

{
  "accountId": "acct_..."
}
```

### Product Management

#### Create Product
```http
POST /api/stripe/connect/products
Content-Type: application/json

{
  "accountId": "acct_...",
  "name": "Product Name",
  "description": "Product Description",
  "priceInCents": 2000,
  "currency": "usd"
}
```

#### List Products
```http
GET /api/stripe/connect/products?accountId=acct_...&limit=10
```

### Checkout

#### Create Checkout Session
```http
POST /api/stripe/connect/checkout
Content-Type: application/json

{
  "accountId": "acct_...",
  "lineItems": [
    {
      "price_data": {
        "unit_amount": 2000,
        "currency": "usd",
        "product_data": {
          "name": "Product Name",
          "description": "Product Description"
        }
      },
      "quantity": 1
    }
  ],
  "applicationFeeAmount": 100,
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

### Webhooks

#### Webhook Endpoint
```http
POST /api/stripe/webhook
Stripe-Signature: t=...,v1=...
```

## User Interface

### Dashboard (`/stripe/connect`)
- Create new connected accounts
- View account status
- Start onboarding process
- Manage existing accounts

### Account Management (`/stripe/connect/account/[accountId]`)
- View account status
- Create products
- Manage existing products
- Access storefront

### Storefront (`/stripe/connect/store/[accountId]`)
- Display products
- Process purchases
- Handle checkout flow

## Key Features

### 1. Connected Account Creation

Uses the new Stripe Connect controller API:

```typescript
const account = await stripe.accounts.create({
  controller: {
    // Platform controls fee collection - connected account pays fees
    fees: {
      payer: 'account' as const
    },
    // Stripe handles payment disputes and losses
    losses: {
      payments: 'stripe' as const
    },
    // Connected account gets full access to Stripe dashboard
    stripe_dashboard: {
      type: 'full' as const
    }
  },
  email,
  country,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
});
```

### 2. Onboarding Flow

- Creates account links for onboarding
- Handles success and refresh URLs
- Tracks onboarding status

### 3. Product Management

- Creates products on connected accounts
- Uses `Stripe-Account` header for account-specific operations
- Supports pricing and descriptions

### 4. Payment Processing

- Uses Direct Charges with application fees
- Implements hosted checkout for simplicity
- Handles success and cancel flows

### 5. Webhook Handling

- Verifies webhook signatures
- Handles multiple event types
- Integrates with Sentry for error tracking

## Event Types Handled

- `account.updated` - Account status changes
- `checkout.session.completed` - Successful checkouts
- `payment_intent.succeeded` - Successful payments
- `payment_intent.payment_failed` - Failed payments
- `product.created` - New products
- `product.updated` - Product updates

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using Stripe signatures
2. **Environment Variables**: Sensitive keys are stored in environment variables
3. **Error Handling**: Comprehensive error handling with Sentry integration
4. **Input Validation**: All API inputs are validated

## Testing

### Test Mode
- Uses Stripe test keys
- Test cards available for payment testing
- Webhook testing with Stripe CLI

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

## Deployment

### Environment Setup
1. Add environment variables to your deployment platform
2. Configure webhook endpoints in Stripe Dashboard
3. Update `NEXT_PUBLIC_BASE_URL` for production

### Webhook Configuration
1. Create webhook endpoint in Stripe Dashboard
2. Select events: `account.*`, `checkout.*`, `payment_intent.*`, `product.*`
3. Set endpoint URL to `https://yourdomain.com/api/stripe/webhook`
4. Copy webhook secret to environment variables

## Monitoring

### Sentry Integration
- Error tracking for all API routes
- Performance monitoring
- Webhook error handling

### Logging
- Console logging for debugging
- Structured logging with context
- Webhook event logging

## Best Practices

1. **Account Management**: Always check account status before operations
2. **Error Handling**: Implement comprehensive error handling
3. **Security**: Verify webhook signatures and validate inputs
4. **Testing**: Test thoroughly in Stripe test mode
5. **Monitoring**: Use Sentry for error tracking and monitoring

## Troubleshooting

### Common Issues

1. **Webhook Verification Failed**
   - Check webhook secret in environment variables
   - Verify endpoint URL in Stripe Dashboard

2. **Account Not Found**
   - Ensure account ID is correct
   - Check if account exists in Stripe Dashboard

3. **Payment Failed**
   - Verify account is properly onboarded
   - Check account capabilities and requirements

4. **Product Creation Failed**
   - Ensure account ID is valid
   - Check account permissions

### Debug Mode
Enable debug logging by setting `debug: true` in Stripe configuration.

## Support

For issues with this integration:
1. Check Stripe Dashboard for account status
2. Review webhook logs in Stripe Dashboard
3. Check Sentry for error details
4. Consult Stripe Connect documentation

## Next Steps

1. **Database Integration**: Store account and product data in database
2. **User Authentication**: Integrate with user management system
3. **Advanced Features**: Add subscription support, multi-currency, etc.
4. **Analytics**: Implement payment and product analytics
5. **Mobile Support**: Add mobile-optimized interfaces
