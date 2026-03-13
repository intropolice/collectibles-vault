import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

const translations = {
  en: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    username: 'Username',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    switchToRegister: 'Create one',
    switchToLogin: 'Sign in',
    invalidCredentials: 'Invalid email or password',
    emailExists: 'Email already registered',
    usernameTaken: 'Username already taken',
    passwordShort: 'Password must be at least 8 characters long',
    welcome: 'Welcome to CollectiblesVault',
    subtitle: 'Manage your precious collections',
    demoAccounts: 'Demo Accounts:',
    adminDemo: 'Admin: admin@collectibles.com / admin123',
    userDemo: 'User: user@example.com / user123',
  },
  ru: {
    login: 'Вход',
    register: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    name: 'Полное имя',
    username: 'Имя пользователя',
    signIn: 'Войти',
    signUp: 'Зарегистрироваться',
    noAccount: 'Нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    switchToRegister: 'Создайте',
    switchToLogin: 'Войдите',
    invalidCredentials: 'Неверный email или пароль',
    emailExists: 'Email уже зарегистрирован',
    usernameTaken: 'Это имя пользователя уже занято',
    passwordShort: 'Пароль должен быть не менее 8 символов',
    welcome: 'Добро пожаловать в CollectiblesVault',
    subtitle: 'Управляйте своими ценными коллекциями',
    demoAccounts: 'Демо аккаунты:',
    adminDemo: 'Админ: admin@collectibles.com / admin123',
    userDemo: 'Пользователь: user@example.com / user123',
  },
};

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = await login(email, password);
      if (!success) {
        setError(t.invalidCredentials);
      }
    } else {
      // Validate inputs before submitting
      if (password.length < 8) {
        setError(t.passwordShort);
        return;
      }
      const result = await register(email, password, username, name);
      if (!result.success) {
        setError(result.error || t.emailExists);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-950 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center"
      >
        {/* Left side - Welcome */}
        <div className="hidden lg:block text-white space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {t.welcome}
            </h1>
            <p className="text-2xl text-purple-100">{t.subtitle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <p className="text-lg font-semibold mb-3">{t.demoAccounts}</p>
            <div className="space-y-2 text-sm text-purple-100">
              <p>🔑 {t.adminDemo}</p>
              <p>👤 {t.userDemo}</p>
            </div>
          </motion.div>
        </div>

        {/* Right side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 lg:p-12"
        >
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-4 rounded-2xl">
              {isLogin ? (
                <LogIn className="w-8 h-8 text-white" />
              ) : (
                <UserPlus className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">
            {isLogin ? t.login : t.register}
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            {isLogin ? t.noAccount : t.haveAccount}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              {isLogin ? t.switchToRegister : t.switchToLogin}
            </button>
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.username}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    required
                    placeholder="lowercase, numbers, underscore only"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl mt-6"
            >
              {isLogin ? t.signIn : t.signUp}
            </button>
          </form>

          {/* Demo accounts for mobile */}
          <div className="lg:hidden mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t.demoAccounts}
            </p>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <p>🔑 {t.adminDemo}</p>
              <p>👤 {t.userDemo}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
