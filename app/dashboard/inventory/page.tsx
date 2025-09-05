'use client';

import { InventoryDashboard } from '@/app/components/commerce/inventory-dashboard';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/app/components/ui/loading-spinner';

export default function InventoryPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your inventory.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pantry Inventory</h1>
        <p className="text-gray-600 mt-1">Manage your ingredients and track what's in your kitchen</p>
      </div>
      
      <InventoryDashboard userId={user.id} />
    </div>
  );
}