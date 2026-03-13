import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ru";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    appName: "CollectiblesVault",
    appSubtitle: "Manage your treasures",
    searchPlaceholder: "Search your collection...",
    addItem: "Add Item",
    profile: "Profile",
    adminPanel: "Admin Panel",
    logout: "Logout",
    
    // Categories
    allItems: "All Items",
    cameras: "Cameras",
    vinylRecords: "Vinyl Records",
    watches: "Watches",
    coins: "Coins",
    books: "Books",
    tradingCards: "Trading Cards",
    stamps: "Stamps",
    videoGames: "Video Games",
    actionFigures: "Action Figures",
    modelCars: "Model Cars",
    jewelry: "Jewelry",
    postcards: "Postcards",
    
    // Stats
    totalValue: "Total Value",
    totalItems: "Total Items",
    averageValue: "Average Value",
    mintCondition: "Mint Condition",
    
    // Collection Grid
    noItemsFound: "No items found",
    adjustFilters: "Try adjusting your search or filters",
    estimatedValue: "Estimated Value",
    year: "Year",
    
    // Conditions
    mint: "Mint",
    excellent: "Excellent",
    veryGood: "Very Good",
    good: "Good",
    fair: "Fair",
    
    // Item Detail Modal
    itemDetails: "Item Details",
    itemId: "Item ID",
    category: "Category",
    condition: "Condition",
    acquired: "Acquired",
    acquisitionDate: "Acquisition Date",
    editItemDetails: "Edit Item Details",
    
    // Add Item Modal
    addNewItem: "Add New Item",
    itemName: "Item Name",
    value: "Value (USD)",
    description: "Description",
    imageUrl: "Image URL (optional)",
    imageUrlHelp: "Leave empty to use default placeholder",
    cancel: "Cancel",
    addToCollection: "Add to Collection",
    descriptionPlaceholder: "Brief description of the item...",
    
    // Collections
    myCollections: "My Collections",
    createCollection: "Create Collection",
    collectionName: "Collection Name",
    enterCollectionName: "e.g., Vintage Cameras",
    enterCollectionDescription: "Add a description...",
    nameRequired: "Collection name is required",
    creating: "Creating...",
    create: "Create",
    optional: "optional",
    
    // Categories
    myCategories: "My Categories",
    addCategory: "Add Category",
    categoryName: "Category Name",
    enterCategoryName: "e.g., Cameras",
    icon: "Icon",
    color: "Color",
    
    // Categories sidebar
    categoriesTitle: "Categories",
  },
  ru: {
    // Header
    appName: "CollectiblesVault",
    appSubtitle: "Управляйте своими сокровищами",
    searchPlaceholder: "Поиск в коллекции...",
    addItem: "Добавить",
    profile: "Профиль",
    adminPanel: "Панель администратора",
    logout: "Выйти",
    
    // Categories
    allItems: "Все предметы",
    cameras: "Камеры",
    vinylRecords: "Виниловые пластинки",
    watches: "Часы",
    coins: "Монеты",
    books: "Книги",
    tradingCards: "Коллекционные карты",
    stamps: "Марки",
    videoGames: "Видеоигры",
    actionFigures: "Фигурки",
    modelCars: "Модели машин",
    jewelry: "Ювелирные изделия",
    postcards: "Открытки",
    
    // Stats
    totalValue: "Общая стоимость",
    totalItems: "Всего предметов",
    averageValue: "Средняя цена",
    mintCondition: "В идеале",
    
    // Collection Grid
    noItemsFound: "Предметы не найдены",
    adjustFilters: "Попробуйте изменить поиск или фильтры",
    estimatedValue: "Оценочная стоимость",
    year: "Год",
    
    // Conditions
    mint: "Идеальное",
    excellent: "Отличное",
    veryGood: "Очень хорошее",
    good: "Хорошее",
    fair: "Удовлетворительное",
    
    // Item Detail Modal
    itemDetails: "Детали предмета",
    itemId: "ID предмета",
    category: "Категория",
    condition: "Состояние",
    acquired: "Приобретено",
    acquisitionDate: "Дата приобретения",
    editItemDetails: "Редактировать детали",
    
    // Add Item Modal
    addNewItem: "Добавить новый предмет",
    itemName: "Название предмета",
    value: "Стоимость (USD)",
    description: "Описание",
    imageUrl: "URL изображения (опционально)",
    imageUrlHelp: "Оставьте пустым для изображения по умолчанию",
    cancel: "Отмена",
    addToCollection: "Добавить в коллекцию",
    descriptionPlaceholder: "Краткое описание предмета...",
    
    // Collections
    myCollections: "Мои коллекции",
    createCollection: "Создать коллекцию",
    collectionName: "Название коллекции",
    enterCollectionName: "Например: Винтажные камеры",
    enterCollectionDescription: "Добавьте описание...",
    nameRequired: "Требуется название коллекции",
    creating: "Создание...",
    create: "Создать",
    optional: "опционально",
    
    // Categories
    myCategories: "Мои категории",
    addCategory: "Добавить категорию",
    categoryName: "Название категории",
    enterCategoryName: "Например: Камеры",
    icon: "Значок",
    color: "Цвет",
    
    // Categories sidebar
    categoriesTitle: "Категории",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ru" : "en"));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}