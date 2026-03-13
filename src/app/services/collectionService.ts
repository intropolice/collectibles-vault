import { apiFetch } from '../api';
import { CollectibleItem } from '../types';

export interface ApiCollection {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiItem {
  id: number;
  name: string;
  category: string;
  value: number;
  condition: string;
  year: number;
  image: string;
  description: string;
  acquired: string;
  collection_id: number;
}

/**
 * Service for fetching collections and items from the API
 */
export const collectionService = {
  /**
   * Get all collections for the current user
   */
  async getUserCollections(token?: string): Promise<ApiCollection[]> {
    try {
      console.log('Fetching user collections...');
      const collections = await apiFetch<ApiCollection[]>('/collections', {}, token);
      console.log('Collections fetched:', collections.length);
      return collections;
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      return [];
    }
  },

  /**
   * Create a new collection
   */
  async createCollection(
    name: string,
    description?: string,
    token?: string
  ): Promise<ApiCollection | null> {
    try {
      return await apiFetch<ApiCollection>(
        '/collections',
        {
          method: 'POST',
          body: JSON.stringify({ name, description }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
        token
      );
    } catch (error) {
      console.error('Failed to create collection:', error);
      return null;
    }
  },

  /**
   * Get all items in a specific collection
   */
  async getCollectionItems(
    collectionId: number,
    token?: string
  ): Promise<ApiItem[]> {
    try {
      return await apiFetch<ApiItem[]>(
        `/items/collection/${collectionId}`,
        {},
        token
      );
    } catch (error) {
      console.error(`Failed to fetch items for collection ${collectionId}:`, error);
      return [];
    }
  },

  /**
   * Get all items from database (global view)
   */
  async getAllItems(token?: string): Promise<CollectibleItem[]> {
    try {
      console.log('Fetching all items from database...');
      const items = await apiFetch<any[]>('/items/all', {}, token);
      console.log('Total items loaded:', items.length);
      return items.map((item) => this.transformBackendItem(item));
    } catch (error) {
      console.error('Failed to fetch all items:', error);
      return [];
    }
  },

  /**
   * Get all items for the current user (across all collections)
   * @deprecated Use getAllItems() instead for global view
   */
  async getUserItems(token?: string): Promise<CollectibleItem[]> {
    try {
      console.log('Fetching user items...');
      const collections = await this.getUserCollections(token);
      console.log('Found collections count:', collections.length);
      const allItems: CollectibleItem[] = [];

      for (const collection of collections) {
        const items = await this.getCollectionItems(collection.id, token);
        console.log(`Items in collection ${collection.id}:`, items.length);
        allItems.push(
          ...items.map((item) => this.transformBackendItem(item))
        );
      }

      console.log('Total items loaded:', allItems.length);
      return allItems;
    } catch (error) {
      console.error('Failed to fetch user items:', error);
      return [];
    }
  },

  /**
   * Transform item from backend format to frontend format
   */
  transformBackendItem(item: any): CollectibleItem {
    const customFields = item.custom_fields_data || {};
    const transformed: CollectibleItem = {
      id: item.id,
      name: item.name,
      description: item.description || '',
      image: item.image_url || item.image || '',
      category: customFields.category || 'uncategorized',
      condition: customFields.condition || 'good',
      value: item.cost || 0,
      year: customFields.year || new Date().getFullYear(),
      acquired: item.acquisition_date || new Date().toISOString(),
      userId: String(item.userId || '0'),
      userName: item.userName || 'Unknown',
    };
    console.log('Transformed item:', transformed);
    return transformed;
  },

  /**
   * Create a new item
   */
  async createItem(
    item: Omit<CollectibleItem, 'id' | 'userId'> & { collectionId: number },
    token?: string
  ): Promise<boolean> {
    try {
      const { collectionId, ...itemData } = item;
      
      // Map old frontend format to backend format
      const backendItem = {
        name: itemData.name,
        description: itemData.description,
        item_type: "physical",
        cost: itemData.value,
        acquisition_date: new Date(itemData.acquired).toISOString(),
        item_id: `${itemData.category.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 100000)}`,
        image_url: itemData.image,
        custom_fields_data: {
          category: itemData.category,
          condition: itemData.condition,
          year: itemData.year,
        },
        tag_ids: [],
      };
      
      console.log('Creating item with data:', backendItem);
      
      const response = await apiFetch(
        `/items?collection_id=${collectionId}`,
        {
          method: 'POST',
          body: JSON.stringify(backendItem),
          headers: {
            'Content-Type': 'application/json',
          },
        },
        token
      );
      
      console.log('Item created successfully:', response);
      return true;
    } catch (error) {
      console.error('Failed to create item:', error);
      // Return false instead of throwing
      return false;
    }
  },

  /**
   * Update an existing item
   */
  async updateItem(
    itemId: number,
    item: Partial<CollectibleItem>,
    token?: string
  ): Promise<boolean> {
    try {
      await apiFetch(
        `/items/${itemId}`,
        {
          method: 'PUT',
          body: JSON.stringify(item),
          headers: {
            'Content-Type': 'application/json',
          },
        },
        token
      );
      return true;
    } catch (error) {
      console.error('Failed to update item:', error);
      return false;
    }
  },

  /**
   * Delete an item
   */
  async deleteItem(itemId: number, token?: string): Promise<boolean> {
    try {
      await apiFetch(
        `/items/${itemId}`,
        {
          method: 'DELETE',
        },
        token
      );
      return true;
    } catch (error) {
      console.error('Failed to delete item:', error);
      return false;
    }
  },

  /**
   * Get user's custom categories
   */
  async getUserCategories(token?: string): Promise<Array<{ id: number; name: string; icon: string; color: string }>> {
    try {
      console.log('Fetching user categories...');
      const categories = await apiFetch<Array<{ id: number; name: string; icon: string; color: string }>>('/categories', {}, token);
      console.log('Categories fetched:', categories.length);
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  /**
   * Create a new category
   */
  async createCategory(
    name: string,
    icon?: string,
    color?: string,
    token?: string
  ): Promise<{ id: number; name: string; icon: string; color: string } | null> {
    try {
      return await apiFetch<{ id: number; name: string; icon: string; color: string }>(
        '/categories',
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            icon: icon || '📦',
            color: color || 'slate',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
        token
      );
    } catch (error) {
      console.error('Failed to create category:', error);
      return null;
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: number, token?: string): Promise<boolean> {
    try {
      await apiFetch(
        `/categories/${categoryId}`,
        {
          method: 'DELETE',
        },
        token
      );
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    }
  },
};

