'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Account {
  id: string;
  email: string;
  country: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements: any;
  created: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  default_price: any;
  created: number;
  active: boolean;
}

export default function AccountManagementPage() {
  const params = useParams();
  const accountId = params.accountId as string;
  
  const [account, setAccount] = useState<Account | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Product creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [creatingProduct, setCreatingProduct] = useState(false);

  useEffect(() => {
    if (accountId) {
      loadAccountData();
    }
  }, [accountId]);

  const loadAccountData = async () => {
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

      setProducts(productsData.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productPrice.trim()) return;

    try {
      setCreatingProduct(true);
      setError(null);

      const priceInCents = Math.round(parseFloat(productPrice) * 100);

      const response = await fetch('/api/stripe/connect/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          name: productName,
          description: productDescription,
          priceInCents,
          currency: 'usd',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      // Add the new product to the list
      setProducts(prev => [...prev, data.product]);
      
      // Reset form
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setCreatingProduct(false);
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
          <p className="mt-4 text-gray-600">Loading account data...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Account not found'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/stripe/connect"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold text-gray-900">
            Account Management
          </h1>
          <p className="text-gray-600 mt-2">
            Managing account: {account.email}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Status */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account Status
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Charges Enabled:</span>
                  <span className={`font-medium ${account.charges_enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {account.charges_enabled ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payouts Enabled:</span>
                  <span className={`font-medium ${account.payouts_enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {account.payouts_enabled ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Details Submitted:</span>
                  <span className={`font-medium ${account.details_submitted ? 'text-green-600' : 'text-red-600'}`}>
                    {account.details_submitted ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium">{account.country?.toUpperCase()}</span>
                </div>
              </div>

              {!account.charges_enabled && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">
                    This account needs to complete onboarding to accept payments.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Products Management */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Products ({products.length})
                </h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showCreateForm ? 'Cancel' : 'Create Product'}
                </button>
              </div>

              {/* Create Product Form */}
              {showCreateForm && (
                <form onSubmit={createProduct} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    Create New Product
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (USD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={creatingProduct}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {creatingProduct ? 'Creating...' : 'Create Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Products List */}
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No products yet. Create your first product to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-gray-600 mt-1">{product.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Price: {formatPrice(product.default_price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <a
                          href={`/stripe/connect/store/${accountId}`}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          View Store
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
