import { 
  Camera, 
  Disc3, 
  Watch, 
  Coins, 
  BookOpen, 
  CreditCard, 
  Stamp, 
  Gamepad2, 
  Sparkles, 
  Car, 
  Gem,
  Mail,
  LayoutGrid,
  Plus,
  FolderPlus
} from "lucide-react";
import { CollectibleItem } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  items: CollectibleItem[];
  collections?: Array<{ id: number; name: string }>;
  selectedCollectionId?: number;
  onCollectionChange?: (collectionId: number) => void;
  onCreateCollection?: () => void;
  customCategories?: Array<{ id: number; name: string; icon: string; color: string }>;
  onCreateCategory?: () => void;
}

export function Sidebar({ 
  selectedCategory, 
  onCategoryChange, 
  items,
  collections = [],
  selectedCollectionId,
  onCollectionChange,
  onCreateCollection,
  customCategories = [],
  onCreateCategory
}: SidebarProps) {
  const { t } = useLanguage();

  const categories = [
    { id: "all", name: t("allItems"), icon: LayoutGrid },
    { id: "cameras", name: t("cameras"), icon: Camera },
    { id: "vinyl", name: t("vinylRecords"), icon: Disc3 },
    { id: "watches", name: t("watches"), icon: Watch },
    { id: "coins", name: t("coins"), icon: Coins },
    { id: "books", name: t("books"), icon: BookOpen },
    { id: "cards", name: t("tradingCards"), icon: CreditCard },
    { id: "stamps", name: t("stamps"), icon: Stamp },
    { id: "games", name: t("videoGames"), icon: Gamepad2 },
    { id: "toys", name: t("actionFigures"), icon: Sparkles },
    { id: "cars", name: t("modelCars"), icon: Car },
    { id: "jewelry", name: t("jewelry"), icon: Gem },
    { id: "postcards", name: t("postcards"), icon: Mail },
  ];

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return items.length;
    return items.filter(item => item.category === categoryId).length;
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 min-h-[calc(100vh-73px)] p-4 transition-colors duration-300 overflow-y-auto">
      {/* Collections Section */}
      {collections.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 transition-colors">{t("myCollections") || "My Collections"}</h2>
            {onCreateCollection && (
              <button
                onClick={onCreateCollection}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title={t("createCollection") || "Create Collection"}
              >
                <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => onCollectionChange?.(collection.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm truncate ${
                  selectedCollectionId === collection.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                📁 {collection.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Collection Button */}
      {collections.length === 0 && onCreateCollection && (
        <button
          onClick={onCreateCollection}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all mb-6"
        >
          <FolderPlus className="w-4 h-4" />
          <span className="text-sm">{t("createCollection") || "Create Collection"}</span>
        </button>
      )}

      {/* Custom Categories Section */}
      {customCategories.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 transition-colors">{t("myCategories") || "My Categories"}</h2>
            {onCreateCategory && (
              <button
                onClick={onCreateCategory}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title={t("addCategory") || "Add Category"}
              >
                <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {customCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(`custom_${category.id}`)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm truncate ${
                  selectedCategory === `custom_${category.id}`
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="mr-2">{category.icon}</span> {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Category Button */}
      {customCategories.length === 0 && onCreateCategory && (
        <button
          onClick={onCreateCategory}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all mb-6"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">{t("addCategory") || "Add Category"}</span>
        </button>
      )}

      {/* Categories Section */}
      <div className="mb-4">
        <h2 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 mb-2 transition-colors">{t("categoriesTitle")}</h2>
      </div>
      
      <nav className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const count = getCategoryCount(category.id);
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm">{category.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
