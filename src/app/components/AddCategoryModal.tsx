import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, icon: string, color: string) => Promise<void>;
}

const iconEmojis = ['📦', '📷', '🎵', '⌚', '💰', '📚', '🎴', '🔖', '🎮', '✨', '🚗', '💍', '📮'];
const colors = [
  { value: 'slate', label: 'Slate', bg: 'bg-slate-100', border: 'border-slate-300' },
  { value: 'red', label: 'Red', bg: 'bg-red-100', border: 'border-red-300' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-100', border: 'border-orange-300' },
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  { value: 'green', label: 'Green', bg: 'bg-green-100', border: 'border-green-300' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-100', border: 'border-blue-300' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-100', border: 'border-purple-300' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-100', border: 'border-pink-300' },
];

export function AddCategoryModal({ isOpen, onClose, onSubmit }: AddCategoryModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState('slate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError(t('nameRequired') || 'Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), icon, color);
      setName('');
      setIcon('📦');
      setColor('slate');
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t('addCategory') || 'Add Category'}
              </h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('categoryName') || 'Category Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('enterCategoryName') || 'e.g., Vintage Cameras'}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 disabled:opacity-50"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t('icon') || 'Icon'}
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {iconEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      disabled={isSubmitting}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                        icon === emoji
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      } disabled:opacity-50`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t('color') || 'Color'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setColor(colorOption.value)}
                      disabled={isSubmitting}
                      className={`p-3 rounded-lg border-2 transition-all ${colorOption.bg} ${
                        color === colorOption.value
                          ? `border-${colorOption.value}-500`
                          : `${colorOption.border}`
                      } disabled:opacity-50`}
                    >
                      <span className="text-xs font-medium">{colorOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (t('creating') || 'Creating...') : (t('create') || 'Create')}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
