// File: app/dashboard/collections/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Settings, 
  Plus, 
  MoreVertical,
  Heart,
  Share2,
  Users,
  Lock,
  Globe
} from 'lucide-react';
import { NibbleCollectionsService } from '@/lib/services/nibble-collections';
import { NibbleCollection, NibbleItem } from '@/types/nibble-collections';
import { EditCollectionDialog } from '@/components/nibble/edit-collection-dialog';
import { AddItemDialog } from '@/components/nibble/add-item-dialog';
import { ItemCard } from '@/components/nibble/item-card';
import { useAuth } from '@/hooks/useAuth';
import { FEATURES } from '@/lib/config/features';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [collection, setCollection] = useState<NibbleCollection | null>(null);
  const [items, setItems] = useState<NibbleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (params.id && user) {
      loadCollection();
      loadItems();
    }
  }, [params.id, user]);

  const loadCollection = async () => {
    try {
      const data = await NibbleCollectionsService.getCollection(params.id as string);
      if (!data) {
        router.push('/dashboard/collections');
        return;
      }
      setCollection(data);
    } catch (error) {
      console.error('Failed to load collection:', error);
      router.push('/dashboard/collections');
    }
  };

  const loadItems = async (cursor?: string) => {
    try {
      const result = await NibbleCollectionsService.listCollectionItems(
        params.id as string,
        30,
        cursor
      );
      
      if (cursor) {
        setItems(prev => [...prev, ...result.items]);
      } else {
        setItems(result.items);
      }
      
      setNextCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCollection = async (updatedData: any) => {
    try {
      const updated = await NibbleCollectionsService.updateCollection(
        collection!.id,
        updatedData
      );
      setCollection(updated);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  const handleDeleteCollection = async () => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      await NibbleCollectionsService.deleteCollection(collection!.id);
      router.push('/dashboard/collections');
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      const newItem = await NibbleCollectionsService.addItem({
        ...itemData,
        collection_id: collection!.id
      });
      setItems(prev => [newItem, ...prev]);
      setShowAddItemDialog(false);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await NibbleCollectionsService.removeItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const loadMore = () => {
    if (hasMore && nextCursor) {
      loadItems(nextCursor);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  const canEdit = user?.id === collection.user_id || collection.collaborators.includes(user?.id || '');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/dashboard/collections')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{collection.title}</h1>
              {collection.description && (
                <p className="text-gray-600 mt-2">{collection.description}</p>
              )}
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditDialog(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Collection"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDeleteCollection}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                  title="Delete Collection"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Collection Meta */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {collection.is_public ? (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Public Collection</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Private Collection</span>
                </>
              )}
            </div>
            
            {collection.collaborators.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{collection.collaborators.length + 1} collaborators</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span>{items.length} items</span>
            </div>
          </div>

          {/* Mood and Cuisine Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {collection.mood_tags.map((mood, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
              >
                {mood}
              </span>
            ))}
            {collection.cuisine_type && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {collection.cuisine_type}
              </span>
            )}
            {collection.dietary_tags.map((dietary, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-mint-100 text-mint-800 rounded-full text-sm font-medium"
              >
                {dietary}
              </span>
            ))}
          </div>
        </div>

        {/* Add Item Button */}
        {canEdit && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddItemDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Recipe to Collection
            </button>
          </div>
        )}

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {canEdit ? 'Start Adding Recipes' : 'No Recipes Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {canEdit 
                ? 'Add your first recipe to this collection to get started'
                : 'This collection is empty for now'
              }
            </p>
            {canEdit && (
              <button
                onClick={() => setShowAddItemDialog(true)}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Add First Recipe
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onRemove={canEdit ? () => handleRemoveItem(item.id) : undefined}
                  onMove={canEdit ? undefined : undefined}
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
                  Load More Recipes
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Collection Dialog */}
      <EditCollectionDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        collection={collection}
        onUpdate={handleUpdateCollection}
      />

      {/* Add Item Dialog */}
      <AddItemDialog
        open={showAddItemDialog}
        onClose={() => setShowAddItemDialog(false)}
        onAdd={handleAddItem}
        collectionId={collection.id}
      />
    </div>
  );
}
