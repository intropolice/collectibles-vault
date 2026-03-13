import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Calendar, Shield, Edit2, Save, X, Camera } from 'lucide-react';
import { motion } from 'motion/react';

const translations = {
  en: {
    profile: 'Profile',
    editProfile: 'Edit Profile',
    save: 'Save Changes',
    cancel: 'Cancel',
    name: 'Full Name',
    email: 'Email',
    role: 'Role',
    memberSince: 'Member Since',
    bio: 'Bio',
    admin: 'Administrator',
    user: 'User',
    bioPlaceholder: 'Tell us about yourself...',
    changeAvatar: 'Change Avatar',
    avatarUrl: 'Avatar URL',
    saved: 'Profile updated successfully!',
  },
  ru: {
    profile: 'Профиль',
    editProfile: 'Редактировать профиль',
    save: 'Сохранить изменения',
    cancel: 'Отменить',
    name: 'Полное имя',
    email: 'Email',
    role: 'Роль',
    memberSince: 'Участник с',
    bio: 'О себе',
    admin: 'Администратор',
    user: 'Пользователь',
    bioPlaceholder: 'Расскажите о себе...',
    changeAvatar: 'Изменить аватар',
    avatarUrl: 'URL аватара',
    saved: 'Профиль успешно обновлен!',
  },
};

export function UserProfile() {
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = translations[language];
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      bio: user.bio || '',
      avatar: user.avatar || '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl"
        >
          {t.saved}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 h-32"></div>

        {/* Profile content */}
        <div className="px-8 pb-8">
          {/* Avatar section */}
          <div className="flex justify-between items-start -mt-16 mb-6">
            <div className="relative">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
                  <Camera className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              )}
            </div>

            <div className="flex gap-2 mt-16">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {t.editProfile}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {t.save}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t.cancel}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile info */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                <User className="w-4 h-4" />
                {t.name}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
              ) : (
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                <Mail className="w-4 h-4" />
                {t.email}
              </label>
              <p className="text-lg text-slate-700 dark:text-slate-300">{user.email}</p>
            </div>

            {/* Avatar URL (only in edit mode) */}
            {isEditing && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  <Camera className="w-4 h-4" />
                  {t.avatarUrl}
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
            )}

            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                <Shield className="w-4 h-4" />
                {t.role}
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}
              >
                {user.role === 'admin' ? t.admin : t.user}
              </span>
            </div>

            {/* Member since */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                <Calendar className="w-4 h-4" />
                {t.memberSince}
              </label>
              <p className="text-lg text-slate-700 dark:text-slate-300">{formatDate(user.created_at)}</p>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                {t.bio}
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t.bioPlaceholder}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                />
              ) : (
                <p className="text-slate-700 dark:text-slate-300">
                  {user.bio || <span className="text-slate-400 italic">{t.bioPlaceholder}</span>}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
