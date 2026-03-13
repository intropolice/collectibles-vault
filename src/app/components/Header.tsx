import { Search, Plus, Vault, Moon, Sun, Languages, User, LogOut, Settings, Shield } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onProfileClick: () => void;
  onAdminClick?: () => void;
}

export function Header({ searchQuery, onSearchChange, onAddClick, onProfileClick, onAdminClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 transition-colors duration-300">
      <div className="px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Vault className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-slate-900 dark:text-white transition-colors">{t("appName")}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{t("appSubtitle")}</p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
              title={language === "en" ? "Переключить на русский" : "Switch to English"}
            >
              <Languages className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">{language === "en" ? "EN" : "RU"}</span>
            </button>

            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{t("addItem")}</span>
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-40"
                      >
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onProfileClick();
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">{t("profile")}</span>
                        </button>
                        {isAdmin && onAdminClick && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onAdminClick();
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            <span className="text-sm">{t("adminPanel")}</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">{t("logout")}</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}