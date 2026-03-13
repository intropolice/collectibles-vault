import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CollectibleItem } from '../types';
import { Users, Package, TrendingUp, Shield, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const translations = {
  en: {
    adminPanel: 'Admin Panel',
    overview: 'Overview',
    totalUsers: 'Total Users',
    totalItems: 'Total Items',
    totalValue: 'Total Value',
    adminUsers: 'Admin Users',
    itemManagement: 'Item Management',
    category: 'Category',
    owner: 'Owner',
    value: 'Value',
    item: 'Item',
    deleteItem: 'Delete Item',
    confirmDelete: 'Are you sure?',
    actions: 'Actions',
  },
  ru: {
    adminPanel: 'Панель администратора',
    overview: 'Обзор',
    totalUsers: 'Всего пользователей',
    totalItems: 'Всего предметов',
    totalValue: 'Общая стоимость',
    adminUsers: 'Администраторов',
    itemManagement: 'Управление предметами',
    category: 'Категория',
    owner: 'Владелец',
    value: 'Стоимость',
    item: 'Предмет',
    deleteItem: 'Удалить предмет',
    confirmDelete: 'Вы уверены?',
    actions: 'Действия',
  },
};

interface AdminPanelProps {
  items: CollectibleItem[];
  onDeleteItem: (id: number) => void;
}

export function AdminPanel({ items, onDeleteItem }: AdminPanelProps) {
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [users, setUsers] = useState<Array<{ id: number; first_name: string; last_name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.token) return;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/users`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser]);

  // Note: Users data loaded from API
  // For now, we'll calculate stats from global items view
  const stats = [
    {
      title: t.totalUsers,
      value: loading ? '...' : users.length,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: t.totalItems,
      value: items.length,
      icon: Package,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: t.totalValue,
      value: `$${items.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: t.adminUsers,
      value: currentUser?.role === 'admin' ? '1' : '0',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
    },
  ];

  // User management functions removed - all user data now comes from API
  // User deletion and role changes should be handled through API endpoints

  const getUserName = (userId: string | number | undefined) => {
    if (!userId) return 'Unknown';
    const user = users.find(u => u.id === userId);
    if (user) return `${user.first_name} ${user.last_name}`;
    return 'Unknown';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          {t.adminPanel}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">{t.overview}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>


      {/* Item Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">{t.itemManagement}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.item}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.category}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.owner}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.value}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-400">{getUserName(item.userId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">${item.value.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        if (window.confirm(t.confirmDelete)) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
