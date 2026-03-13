import { useState, useEffect } from 'react';
import { CollectibleItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { X, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface EditItemModalProps {
  item: CollectibleItem;
  onClose: () => void;
  onSave: (item: CollectibleItem) => void;
}

const translations = {
  en: {
    editItem: 'Edit Item',
    name: 'Name',
    category: 'Category',
    value: 'Value ($)',
    condition: 'Condition',
    year: 'Year',
    image: 'Image URL',
    description: 'Description',
    acquired: 'Acquired Date',
    save: 'Save Changes',
    cancel: 'Cancel',
    cameras: 'Cameras',
    vinyl: 'Vinyl Records',
    watches: 'Watches',
    coins: 'Coins',
    books: 'Books',
    cards: 'Trading Cards',
    stamps: 'Stamps',
    games: 'Video Games',
    toys: 'Toys',
    cars: 'Model Cars',
    jewelry: 'Jewelry',
    postcards: 'Postcards',
    mint: 'Mint',
    excellent: 'Excellent',
    'very good': 'Very Good',
    good: 'Good',
    fair: 'Fair',
  },
  ru: {
    editItem: 'Редактировать предмет',
    name: 'Название',
    category: 'Категория',
    value: 'Стоимость ($)',
    condition: 'Состояние',
    year: 'Год',
    image: 'URL изображения',
    description: 'Описание',
    acquired: 'Дата приобретения',
    save: 'Сохранить изменения',
    cancel: 'Отменить',
    cameras: 'Камеры',
    vinyl: 'Виниловые пластинки',
    watches: 'Часы',
    coins: 'Монеты',
    books: 'Книги',
    cards: 'Коллекционные карты',
    stamps: 'Марки',
    games: 'Видеоигры',
    toys: 'Игрушки',
    cars: 'Модели машин',
    jewelry: 'Украшения',
    postcards: 'Открытки',
    mint: 'Идеальное',
    excellent: 'Отличное',
    'very good': 'Очень хорошее',
    good: 'Хорошее',
    fair: 'Удовлетворительное',
  },
};

const categories = [
  'cameras',
  'vinyl',
  'watches',
  'coins',
  'books',
  'cards',
  'stamps',
  'games',
  'toys',
  'cars',
  'jewelry',
  'postcards',
];

const conditions = ['mint', 'excellent', 'very good', 'good', 'fair'];

export function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = translations[language];
  const [formData, setFormData] = useState(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{t.editItem}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.name}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.category}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t[cat as keyof typeof t]}
                </option>
              ))}
            </select>
          </div>

          {/* Value and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.value}
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                required
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.year}
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                required
                min="1800"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.condition}
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            >
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {t[cond as keyof typeof t]}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.image}
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none resize-none"
            />
          </div>

          {/* Acquired Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.acquired}
            </label>
            <input
              type="date"
              value={formData.acquired}
              onChange={(e) => setFormData({ ...formData, acquired: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              {t.save}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
