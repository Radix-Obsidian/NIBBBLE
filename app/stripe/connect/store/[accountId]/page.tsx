'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  default_price: any;
  created: number;
  active: boolean;
}

interface Account {
  id: string;
  email: string;
  country: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

export default function StorefrontPage() {
  const params = useParams();
  const accountId = params.accountId as string;
  
  const [account, setAccount] = useState<Account | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (accountId) {
      loadStoreData();
    }
  }, [accountId]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load account status
      const accountResponse = await fetch(`/api/stripe/connect/accounts/${accountId}`);
      const accountData = await accountResponse.json();

      if (!accountResponse.ok) {
        throw new Error(accountData.error || 'Failed to load account');
      }

      setAccount(accountData.account);

      // Load products
      const productsResponse = await fetch(`/api/stripe/connect/products?accountId=${accountId}`);
      const productsData = await productsResponse.json();

      if (!productsResponse.ok) {
        throw new Error(productsData.error || 'Failed to load products');
      }

      setProducts(productsData.products.filter((p: Product) => p.active));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const purchaseProduct = async (product: Product) => {
    try {
      setPurchasing(product.id);
      setError(null);

      // Calculate application fee (5% of the product price)
      const productPrice = product.default_price.unit_amount;
      const applicationFeeAmount = Math.round(productPrice * 0.05); // 5% fee

      const response = await fetch('/api/stripe/connect/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          lineItems: [{
            price_data: {
              unit_amount: productPrice,
              currency: product.default_price.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
            },
            quantity: 1,
          }],
          applicationFeeAmount,
          successUrl: `${window.location.origin}/stripe/connect/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/stripe/connect/store/${accountId}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setPurchasing(null);
    }
  };

  const formatPrice = (priceData: any) => {
    if (!priceData) return 'No price';
    const amount = priceData.unit_amount / 100;
    const currency = priceData.currency.toUpperCase();
    return `$${amount.toFixed(2)} ${currency}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Store not found'}</p>
          <a
            href="/stripe/connect"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check if account can accept payments
  if (!account.charges_enabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Store Not Ready
            </h2>
            <p className="text-yellow-700 mb-4">
              This store is not yet ready to accept payments. The account owner needs to complete the onboarding process.
            </p>
            <a
              href="/stripe/connect"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {account.email}'s Store
          </h1>
          <p className="text-gray-600">
            Powered by Nibbble Connect
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white shadow rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Products Available
              </h2>
              <p className="text-gray-600">
                This store doesn't have any products yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.default_price)}
                    </span>
                    
                    <button
                      onClick={() => purchaseProduct(product)}
                      disabled={purchasing === product.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasing === product.id ? 'Processing...' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Secure payments powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
