import Stripe from 'stripe';

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil', // Latest Stripe API version
});

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required. Please add it to your environment variables.');
}

if (!process.env.STRIPE_PUBLISHABLE_KEY) {
  throw new Error('STRIPE_PUBLISHABLE_KEY is required. Please add it to your environment variables.');
}

if (!process.env.STRIPE_CONNECT_CLIENT_ID) {
  throw new Error('STRIPE_CONNECT_CLIENT_ID is required. Please add it to your environment variables.');
}

// Export the configured Stripe instance
export { stripe };

// Export environment variables for client-side use
export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID!,
  apiVersion: '2025-08-27.basil',
};

// Helper function to create a connected account with the specified controller properties
export async function createConnectedAccount(email: string, country: string = 'US') {
  try {
    const account = await stripe.accounts.create({
      // Use controller properties instead of top-level type
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
      // Add basic account information
      email,
      country,
      // Enable capabilities for the account
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating connected account:', error);
    throw error;
  }
}

// Helper function to create account links for onboarding
export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
}

// Helper function to retrieve account status
export async function getAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error('Error retrieving account status:', error);
    throw error;
  }
}

// Helper function to create products on a connected account
export async function createProductOnAccount(
  accountId: string,
  name: string,
  description: string,
  priceInCents: number,
  currency: string = 'usd'
) {
  try {
    const product = await stripe.products.create({
      name,
      description,
      default_price_data: {
        unit_amount: priceInCents,
        currency,
      },
    }, {
      stripeAccount: accountId, // Use stripeAccount for the Stripe-Account header
    });

    return product;
  } catch (error) {
    console.error('Error creating product on connected account:', error);
    throw error;
  }
}

// Helper function to list products from a connected account
export async function listProductsFromAccount(accountId: string, limit: number = 10) {
  try {
    const products = await stripe.products.list({
      limit,
    }, {
      stripeAccount: accountId, // Use stripeAccount for the Stripe-Account header
    });

    return products;
  } catch (error) {
    console.error('Error listing products from connected account:', error);
    throw error;
  }
}

// Helper function to create checkout session with application fee
export async function createCheckoutSession(
  accountId: string,
  lineItems: Array<{
    price_data: {
      unit_amount: number;
      currency: string;
      product_data: {
        name: string;
        description?: string;
      };
    };
    quantity: number;
  }>,
  applicationFeeAmount: number,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      payment_intent_data: {
        // Application fee for the platform
        application_fee_amount: applicationFeeAmount,
      },
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    }, {
      stripeAccount: accountId, // Use stripeAccount for the Stripe-Account header
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}
