import { motion } from "motion/react";
import { X, Calendar, DollarSign, Info, Clock } from "lucide-react";
import { CollectibleItem } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface ItemDetailModalProps {
  item: CollectibleItem;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const { t, language } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl transition-colors"
      >
        {/* Header */}
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h2 className="text-white text-2xl mb-1">{item.name}</h2>
            <p className="text-white/80">{item.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-256px)]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors">{t("estimatedValue")}</span>
              </div>
              <div className="text-2xl text-slate-900 dark:text-white transition-colors">${item.value.toLocaleString()}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors">{t("year")}</span>
              </div>
              <div className="text-2xl text-slate-900 dark:text-white transition-colors">{item.year}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors">{t("condition")}</span>
              </div>
              <div className="text-2xl text-slate-900 dark:text-white transition-colors capitalize">{t(item.condition.replace(" ", ""))}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors">{t("acquired")}</span>
              </div>
              <div className="text-2xl text-slate-900 dark:text-white transition-colors">
                {new Date(item.acquired).toLocaleDateString(language === "en" ? "en-US" : "ru-RU", { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 transition-colors">
            <h3 className="text-slate-900 dark:text-white mb-3 transition-colors">{t("itemDetails")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <span className="text-slate-600 dark:text-slate-400 transition-colors">{t("itemId")}</span>
                <span className="text-slate-900 dark:text-white transition-colors">#{item.id.toString().padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <span className="text-slate-600 dark:text-slate-400 transition-colors">{t("category")}</span>
                <span className="text-slate-900 dark:text-white transition-colors capitalize">{item.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <span className="text-slate-600 dark:text-slate-400 transition-colors">{t("acquisitionDate")}</span>
                <span className="text-slate-900 dark:text-white transition-colors">
                  {new Date(item.acquired).toLocaleDateString(language === "en" ? "en-US" : "ru-RU", { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 transition-colors">
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              {t("editItemDetails")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
