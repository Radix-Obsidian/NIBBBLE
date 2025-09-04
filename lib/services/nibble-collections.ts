// File: lib/services/nibble-collections.ts

import { supabase } from '@/lib/supabase/client';
import { 
  NibbleCollection, 
  NibbleItem, 
  CreateCollectionInput, 
  UpdateCollectionInput, 
  AddItemInput 
} from '@/types/nibble-collections';

export class NibbleCollectionsService {
  // Collection Management
  static async createCollection(input: CreateCollectionInput): Promise<NibbleCollection> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('nibble_collections')
      .insert({
        ...input,
        user_id: user.id,
        mood_tags: input.mood_tags || [],
        dietary_tags: input.dietary_tags || [],
        collaborators: input.collaborators || []
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create collection: ${error.message}`);
    return data;
  }

  static async updateCollection(
    id: string, 
    input: UpdateCollectionInput
  ): Promise<NibbleCollection> {
    const { data, error } = await supabase
      .from('nibble_collections')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update collection: ${error.message}`);
    return data;
  }

  static async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from('nibble_collections')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete collection: ${error.message}`);
  }

  static async getCollection(id: string): Promise<NibbleCollection | null> {
    const { data, error } = await supabase
      .from('nibble_collections')
      .select(`
        *,
        nibble_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get collection: ${error.message}`);
    }
    return data;
  }

  static async listUserCollections(
    userId: string, 
    limit = 24, 
    cursor?: string
  ): Promise<{ collections: NibbleCollection[]; nextCursor?: string }> {
    let query = supabase
      .from('nibble_collections')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit + 1); // Get one extra to check if there's more

    if (cursor) {
      query = query.lt('updated_at', cursor);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to list collections: ${error.message}`);

    const collections = data || [];
    const hasMore = collections.length > limit;
    const nextCursor = hasMore ? collections[limit - 1].updated_at : undefined;

    return {
      collections: collections.slice(0, limit),
      nextCursor
    };
  }

  static async listPublicCollections(
    limit = 24, 
    cursor?: string,
    moodFilter?: string[],
    cuisineFilter?: string
  ): Promise<{ collections: NibbleCollection[]; nextCursor?: string }> {
    let query = supabase
      .from('nibble_collections')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('updated_at', cursor);
    }

    if (moodFilter && moodFilter.length > 0) {
      query = query.overlaps('mood_tags', moodFilter);
    }

    if (cuisineFilter) {
      query = query.eq('cuisine_type', cuisineFilter);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to list public collections: ${error.message}`);

    const collections = data || [];
    const hasMore = collections.length > limit;
    const nextCursor = hasMore ? collections[limit - 1].updated_at : undefined;

    return {
      collections: collections.slice(0, limit),
      nextCursor
    };
  }

  // Item Management
  static async addItem(input: AddItemInput): Promise<NibbleItem> {
    const { data, error } = await supabase
      .from('nibble_items')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(`Failed to add item: ${error.message}`);
    return data;
  }

  static async removeItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('nibble_items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to remove item: ${error.message}`);
  }

  static async moveItem(itemId: string, newCollectionId: string): Promise<NibbleItem> {
    const { data, error } = await supabase
      .from('nibble_items')
      .update({ collection_id: newCollectionId })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw new Error(`Failed to move item: ${error.message}`);
    return data;
  }

  static async listCollectionItems(
    collectionId: string, 
    limit = 30, 
    cursor?: string
  ): Promise<{ items: NibbleItem[]; nextCursor?: string }> {
    let query = supabase
      .from('nibble_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to list items: ${error.message}`);

    const items = data || [];
    const hasMore = items.length > limit;
    const nextCursor = hasMore ? items[limit - 1].created_at : undefined;

    return {
      items: items.slice(0, limit),
      nextCursor
    };
  }

  // Utility Methods
  static async setCollectionCover(collectionId: string, coverImage: string): Promise<void> {
    const { error } = await supabase
      .from('nibble_collections')
      .update({ cover_image: coverImage })
      .eq('id', collectionId);

    if (error) throw new Error(`Failed to set cover: ${error.message}`);
  }

  static async toggleCollectionVisibility(collectionId: string, isPublic: boolean): Promise<void> {
    const { error } = await supabase
      .from('nibble_collections')
      .update({ is_public: isPublic })
      .eq('id', collectionId);

    if (error) throw new Error(`Failed to toggle visibility: ${error.message}`);
  }
}
