import { motion } from "motion/react";
import { X } from "lucide-react";
import { useState } from "react";
import { CollectibleItem } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<CollectibleItem, 'id' | 'userId'>) => Promise<void>;
}

export function AddItemModal({ onClose, onAdd }: AddItemModalProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "cameras",
    value: "",
    condition: "excellent",
    year: "",
    image: "",
    description: "",
    acquired: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      console.log('Form submitted with data:', formData);
      // Map old form fields to new data structure
      const mappedItem: Omit<CollectibleItem, 'id' | 'userId'> = {
        name: formData.name,
        category: formData.category,
        value: parseFloat(formData.value),
        condition: formData.condition,
        year: parseInt(formData.year),
        image: formData.image || "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
        description: formData.description,
        acquired: formData.acquired,
      };
      
      await onAdd(mappedItem);
      console.log('Item added successfully');
      
      // Reset form
      setFormData({
        name: "",
        category: "cameras",
        value: "",
        condition: "excellent",
        year: "",
        image: "",
        description: "",
        acquired: new Date().toISOString().split('T')[0],
      });
      
      // Close modal after successful submission
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl transition-colors"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white text-xl">{t("addNewItem")}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t("itemName")} *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                placeholder="e.g., Leica M3 (1954)"
              />
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t("category")} *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                >
                  <option value="cameras">{t("cameras")}</option>
                  <option value="vinyl">{t("vinylRecords")}</option>
                  <option value="watches">{t("watches")}</option>
                  <option value="coins">{t("coins")}</option>
                  <option value="books">{t("books")}</option>
                  <option value="cards">{t("tradingCards")}</option>
                  <option value="stamps">{t("stamps")}</option>
                  <option value="games">{t("videoGames")}</option>
                  <option value="toys">{t("actionFigures")}</option>
                  <option value="cars">{t("modelCars")}</option>
                  <option value="jewelry">{t("jewelry")}</option>
                  <option value="postcards">{t("postcards")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t("condition")} *</label>
                <select
                  required
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                >
                  <option value="mint">{t("mint")}</option>
                  <option value="excellent">{t("excellent")}</option>
                  <option value="very good">{t("veryGood")}</option>
                  <option value="good">{t("good")}</option>
                  <option value="fair">{t("fair")}</option>
                </select>
              </div>
            </div>

            {/* Value and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t("value")} (USD) *</label>
                <input
                  type="number"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t("year")} *</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  placeholder="1990"
                />
              </div>
            </div>

            {/* Acquisition Date */}
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t("acquisitionDate")} *</label>
              <input
                type="date"
                required
                value={formData.acquired}
                onChange={(e) => setFormData({ ...formData, acquired: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t("imageUrl")}</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">{t("imageUrlHelp")}</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 transition-colors">{t("description")} *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors"
                rows={3}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : t("addToCollection")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}