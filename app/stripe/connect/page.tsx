'use client';

import { useState, useEffect } from 'react';
import { stripeConfig } from '@/lib/stripe/connect';

interface ConnectedAccount {
  id: string;
  email: string;
  country: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements: any;
  created: number;
}

export default function StripeConnectPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Load existing accounts (in a real app, you'd store these in a database)
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch from your database
      // For demo purposes, we'll start with an empty array
      setAccounts([]);
    } catch (err) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountEmail.trim()) return;

    try {
      setCreatingAccount(true);
      setError(null);

      const response = await fetch('/api/stripe/connect/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAccountEmail,
          country: 'US',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Add the new account to the list
      setAccounts(prev => [...prev, data.account]);
      setNewAccountEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setCreatingAccount(false);
    }
  };

  const startOnboarding = async (accountId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/stripe/connect/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create onboarding link');
      }

      // Redirect to Stripe onboarding
      window.location.href = data.accountLink.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start onboarding');
    }
  };

  const getAccountStatus = async (accountId: string) => {
    try {
      const response = await fetch(`/api/stripe/connect/accounts/${accountId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get account status');
      }

      // Update the account in the list
      setAccounts(prev => 
        prev.map(account => 
          account.id === accountId ? { ...account, ...data.account } : account
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get account status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Stripe Connect Dashboard
            </h1>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Create New Account Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Connected Account
              </h2>
              <form onSubmit={createAccount} className="flex gap-4">
                <input
                  type="email"
                  value={newAccountEmail}
                  onChange={(e) => setNewAccountEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingAccount ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            </div>

            {/* Accounts List */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Connected Accounts
              </h2>

              {loading ? (
                <p className="text-gray-500">Loading accounts...</p>
              ) : accounts.length === 0 ? (
                <p className="text-gray-500">No connected accounts yet. Create one above to get started.</p>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onStartOnboarding={startOnboarding}
                      onRefreshStatus={() => getAccountStatus(account.id)}
                    />
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

interface AccountCardProps {
  account: ConnectedAccount;
  onStartOnboarding: (accountId: string) => void;
  onRefreshStatus: () => void;
}

function AccountCard({ account, onStartOnboarding, onRefreshStatus }: AccountCardProps) {
  const isOnboarded = account.charges_enabled && account.payouts_enabled;
  const needsOnboarding = !account.details_submitted;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{account.email}</h3>
          <p className="text-sm text-gray-500">
            Account ID: {account.id}
          </p>
          <p className="text-sm text-gray-500">
            Country: {account.country?.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            isOnboarded 
              ? 'bg-green-100 text-green-800' 
              : needsOnboarding 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {isOnboarded ? 'Onboarded' : needsOnboarding ? 'Needs Onboarding' : 'Incomplete'}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Charges Enabled:</span>
          <span className={`ml-2 ${account.charges_enabled ? 'text-green-600' : 'text-red-600'}`}>
            {account.charges_enabled ? 'Yes' : 'No'}
          </span>
        </div>
        <div>
          <span className="font-medium">Payouts Enabled:</span>
          <span className={`ml-2 ${account.payouts_enabled ? 'text-green-600' : 'text-red-600'}`}>
            {account.payouts_enabled ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {needsOnboarding && (
          <button
            onClick={() => onStartOnboarding(account.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Onboard to Collect Payments
          </button>
        )}
        
        <button
          onClick={onRefreshStatus}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Refresh Status
        </button>

        {isOnboarded && (
          <a
            href={`/stripe/connect/account/${account.id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Manage Account
          </a>
        )}
      </div>
    </div>
  );
}
