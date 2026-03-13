import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatsCards } from './StatsCards';
import { CollectionGrid } from './CollectionGrid';
import { ItemDetailModal } from './ItemDetailModal';
import { AddItemModal } from './AddItemModal';
import { EditItemModal } from './EditItemModal';
import { AddCollectionModal } from './AddCollectionModal';
import { AddCategoryModal } from './AddCategoryModal';
import { AuthPage } from './AuthPage';
import { UserProfile } from './UserProfile';
import { AdminPanel } from './AdminPanel';
import { CollectibleItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { collectionService } from '../services/collectionService';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CollectibleItem | null>(null);
  const [editingItem, setEditingItem] = useState<CollectibleItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'collection' | 'profile' | 'admin'>('collection');
  const [items, setItems] = useState<CollectibleItem[]>([]);
  const [collections, setCollections] = useState<Array<{ id: number; name: string }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultCollectionId, setDefaultCollectionId] = useState<number>(1);

  // Load items and collections from API on mount
  useEffect(() => {
    const fetchData = async () => {
      if (user?.token) {
        setIsLoading(true);
        try {
          // Get user's collections
          let fetchedCollections = await collectionService.getUserCollections(user.token);
          
          // If no collections exist, create a default one
          if (fetchedCollections.length === 0) {
            const newCollection = await collectionService.createCollection(
              'My Collection',
              'Default collection',
              user.token
            );
            if (newCollection) {
              setDefaultCollectionId(newCollection.id);
              fetchedCollections = [newCollection];
            }
          } else {
            setDefaultCollectionId(fetchedCollections[0].id);
          }
          
          setCollections(fetchedCollections);
          
          // Get user's custom categories
          const fetchedCategories = await collectionService.getUserCategories(user.token);
          setCategories(fetchedCategories);
          
          // Fetch ALL items from database (global view)
          const fetchedItems = await collectionService.getAllItems(user.token);
          setItems(fetchedItems);
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user?.token]);

  // If not logged in, show auth page
  if (!user) {
    console.log('No user, showing auth page');
    return <AuthPage />;
  }

  console.log('User logged in:', user.email, 'Loading collections and items');
  console.log('Current state:', { isLoading, defaultCollectionId, itemsCount: items.length });

  const handleAddItem = async (newItem: Omit<CollectibleItem, 'id' | 'userId'>): Promise<void> => {
    if (!user.token) {
      console.error('No user token available');
      return;
    }
    
    try {
      console.log('Creating item with collection ID:', defaultCollectionId);
      const success = await collectionService.createItem({
        ...newItem,
        collectionId: defaultCollectionId,
      }, user.token);
      
      if (success) {
        console.log('Item created successfully, refreshing list');
        // Refresh items from API (global view)
        const updatedItems = await collectionService.getAllItems(user.token);
        console.log('Updated items loaded:', updatedItems.length);
        setItems(updatedItems);
      } else {
        console.error('Failed to create item');
        throw new Error('Failed to create item');
      }
    } catch (error) {
      console.error('Error in handleAddItem:', error);
      throw error;
    }
  };

  const handleEditItem = async (updatedItem: CollectibleItem) => {
    if (!user.token) return;
    
    const success = await collectionService.updateItem(updatedItem.id, updatedItem, user.token);
    
    if (success) {
      // Refresh items from API (global view)
      const refreshedItems = await collectionService.getAllItems(user.token);
      setItems(refreshedItems);
      setEditingItem(null);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!user.token) return;
    
    const success = await collectionService.deleteItem(id, user.token);
    
    if (success) {
      // Refresh items from API (global view)
      const updatedItems = await collectionService.getAllItems(user.token);
      setItems(updatedItems);
    }
  };

  const handleCreateCollection = async (name: string, description: string) => {
    if (!user.token) return;
    
    try {
      const newCollection = await collectionService.createCollection(name, description, user.token);
      if (newCollection) {
        setCollections([...collections, newCollection]);
        setDefaultCollectionId(newCollection.id);
        console.log('Collection created:', newCollection);
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  };

  const handleCreateCategory = async (name: string, icon: string, color: string) => {
    if (!user.token) return;
    
    try {
      const newCategory = await collectionService.createCategory(name, icon, color, user.token);
      if (newCategory) {
        setCategories([...categories, newCategory]);
        console.log('Category created:', newCategory);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render based on current view
  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={() => setIsAddModalOpen(true)}
          onProfileClick={() => setCurrentView('profile')}
          onAdminClick={() => setCurrentView('admin')}
        />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <button
              onClick={() => setCurrentView('collection')}
              className="mb-6 text-violet-600 dark:text-violet-400 hover:underline"
            >
              ← Back to Collection
            </button>
            <UserProfile />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={() => setIsAddModalOpen(true)}
          onProfileClick={() => setCurrentView('profile')}
          onAdminClick={() => setCurrentView('admin')}
        />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <button
              onClick={() => setCurrentView('collection')}
              className="mb-6 text-violet-600 dark:text-violet-400 hover:underline"
            >
              ← Back to Collection
            </button>
            <AdminPanel items={items} onDeleteItem={handleDeleteItem} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col text-slate-900 dark:text-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => setIsAddModalOpen(true)}
        onProfileClick={() => setCurrentView('profile')}
        onAdminClick={() => setCurrentView('admin')}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
            <p className="mt-4 text-lg">Loading your collection...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1">
          <Sidebar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            items={items}
            collections={collections}
            selectedCollectionId={defaultCollectionId}
            onCollectionChange={setDefaultCollectionId}
            onCreateCollection={() => setIsAddCollectionModalOpen(true)}
            customCategories={categories}
            onCreateCategory={() => setIsAddCategoryModalOpen(true)}
          />

          <main className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-800">
            <StatsCards items={items} />
            <CollectionGrid
              items={filteredItems}
              onItemClick={setSelectedItem}
              onEditClick={setEditingItem}
            />
          </main>
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleEditItem}
        />
      )}

      {isAddModalOpen && (
        <AddItemModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddItem} />
      )}

      {isAddCollectionModalOpen && (
        <AddCollectionModal
          isOpen={isAddCollectionModalOpen}
          onClose={() => setIsAddCollectionModalOpen(false)}
          onSubmit={handleCreateCollection}
        />
      )}

      {isAddCategoryModalOpen && (
        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSubmit={handleCreateCategory}
        />
      )}
    </div>
  );
}
