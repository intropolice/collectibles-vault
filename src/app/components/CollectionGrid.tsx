import { motion } from "motion/react";
import { CollectibleItem } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { Edit2 } from "lucide-react";

interface CollectionGridProps {
  items: CollectibleItem[];
  onItemClick: (item: CollectibleItem) => void;
  onEditClick?: (item: CollectibleItem) => void;
}

const conditionColors: Record<string, string> = {
  mint: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  excellent: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  "very good": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  good: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  fair: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
};

export function CollectionGrid({ items, onItemClick, onEditClick }: CollectionGridProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 transition-colors">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-xl text-slate-900 dark:text-white mb-2 transition-colors">{t("noItemsFound")}</h3>
        <p className="text-slate-500 dark:text-slate-400 transition-colors">{t("adjustFilters")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 transition-all duration-300 group"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
            <div onClick={() => onItemClick(item)} className="cursor-pointer w-full h-full">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="absolute top-3 right-3">
              <div className={`px-2.5 py-1 rounded-full text-xs backdrop-blur-sm ${conditionColors[item.condition] || conditionColors.good}`}>
                {t((item.condition || 'good').replace(" ", ""))}
              </div>
            </div>
            {/* Edit button - only show for item owner or admin */}
            {user && (user.id === item.userId || user.role === 'admin') && onEditClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick(item);
                }}
                className="absolute top-3 left-3 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4" onClick={() => onItemClick(item)} style={{ cursor: 'pointer' }}>
            <h3 className="text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {item.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 transition-colors">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{t("estimatedValue")}</div>
                <div className="text-lg text-slate-900 dark:text-white transition-colors">${item.value.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{t("year")}</div>
                <div className="text-lg text-slate-900 dark:text-white transition-colors">{item.year}</div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}