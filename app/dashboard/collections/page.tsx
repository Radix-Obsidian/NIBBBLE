// File: app/dashboard/collections/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Grid3X3, List, ShoppingCart } from 'lucide-react';
import { CollectionCard } from '@/components/nibble/collection-card';
import { CreateCollectionDialog } from '@/components/nibble/create-collection-dialog';
import { CollectionsFilter } from '@/components/nibble/collections-filter';
import CollectionToCart from '@/app/components/commerce/collection-to-cart';
import { NibbleCollectionsService } from '@/lib/services/nibble-collections';
import { NibbleCollection, MOOD_TAGS, CUISINE_TYPES, DIETARY_TAGS } from '@/types/nibble-collections';
import { useAuth } from '@/hooks/useAuth';
import { FEATURES } from '@/lib/config/features';

export default function CollectionsPage() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<NibbleCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    mood: [] as string[],
    cuisine: '' as string,
    dietary: [] as string[],
    search: ''
  });
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user, filters]);

  const loadCollections = async (cursor?: string) => {
    try {
      setLoading(true);
      const result = await NibbleCollectionsService.listUserCollections(
        user!.id,
        24,
        cursor
      );
      
      if (cursor) {
        setCollections(prev => [...prev, ...result.collections]);
      } else {
        setCollections(result.collections);
      }
      
      setNextCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (collectionData: any) => {
    try {
      const newCollection = await NibbleCollectionsService.createCollection(collectionData);
      setCollections(prev => [newCollection, ...prev]);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleCollectionClick = (collection: NibbleCollection) => {
    // Navigate to collection detail
    window.location.href = `/dashboard/collections/${collection.id}`;
  };

  const loadMore = () => {
    if (hasMore && nextCursor) {
      loadCollections(nextCursor);
    }
  };

  if (!FEATURES.enableNibbleCollections) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature Coming Soon</h1>
          <p className="text-gray-600">NIBBBLE Collections will be available soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Nibbles</h1>
              <p className="text-gray-600 mt-2">
                Organize your favorite recipes by mood, cuisine, and occasion
              </p>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Collection
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your collections..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          <div className="flex border border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <CollectionsFilter
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Collections Grid */}
        {loading && collections.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your First Collection</h3>
            <p className="text-gray-600 mb-6">
              Start organizing your favorite recipes by mood, cuisine, or occasion
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Create Collection
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onClick={() => handleCollectionClick(collection)}
                  className={viewMode === 'list' ? 'flex-row h-auto' : ''}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Load More Collections
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Collection Dialog */}
      <CreateCollectionDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateCollection}
      />
    </div>
  );
}
