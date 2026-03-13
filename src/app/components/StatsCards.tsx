import { TrendingUp, DollarSign, Package, Star } from "lucide-react";
import { CollectibleItem } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface StatsCardsProps {
  items: CollectibleItem[];
}

export function StatsCards({ items }: StatsCardsProps) {
  const { t } = useLanguage();
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const totalItems = items.length;
  const averageValue = totalItems > 0 ? totalValue / totalItems : 0;
  const mintConditionItems = items.filter(item => item.condition === "mint").length;

  const stats = [
    {
      label: t("totalValue"),
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: t("totalItems"),
      value: totalItems.toString(),
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: t("averageValue"),
      value: `$${Math.round(averageValue).toLocaleString()}`,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: t("mintCondition"),
      value: mintConditionItems.toString(),
      icon: Star,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center transition-colors`}>
                <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
                +12%
              </div>
            </div>
            <div className="text-2xl text-slate-900 dark:text-white mb-1 transition-colors">{stat.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 transition-colors">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
