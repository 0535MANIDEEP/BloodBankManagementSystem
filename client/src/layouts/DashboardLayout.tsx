import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Droplet,
  FileSpreadsheet,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  HeartHandshake
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Apply dark mode classes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define Nav links based on Role
  const navLinks = {
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { to: '/admin/inventory', label: 'Manage Inventory', icon: <Droplet className="h-5 w-5" /> },
      { to: '/admin/requests', label: 'Manage Requests', icon: <FileSpreadsheet className="h-5 w-5" /> },
      { to: '/admin/donors', label: 'Manage Donors', icon: <Users className="h-5 w-5" /> }
    ],
    donor: [
      { to: '/donor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { to: '/donor/donate', label: 'Donate Blood', icon: <HeartHandshake className="h-5 w-5" /> },
      { to: '/donor/profile', label: 'Profile', icon: <Settings className="h-5 w-5" /> }
    ],
    hospital: [
      { to: '/hospital/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { to: '/hospital/request', label: 'Request Blood', icon: <Droplet className="h-5 w-5" /> },
      { to: '/hospital/track', label: 'Track Requests', icon: <FileSpreadsheet className="h-5 w-5" /> }
    ]
  };

  const links = user ? navLinks[user.role] : [];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#121212] transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass-nav border-r border-slate-200 dark:border-white/5 z-20">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 bg-gradient-to-br from-red-600 to-red-500 rounded-xl text-white shadow-md shadow-red-500/20">
            <Droplet className="h-6 w-6 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            BloodGrid
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100/40 dark:bg-neutral-800/40 border border-slate-200/20">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-64 bg-white dark:bg-[#1E1E1E] flex flex-col h-full z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-red-600 to-red-500 rounded-lg text-white">
                    <Droplet className="h-5 w-5" />
                  </div>
                  <span className="font-extrabold text-lg text-slate-800 dark:text-white">
                    BloodGrid
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100/40 dark:bg-neutral-800/40">
                  <div className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                      {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="glass-nav h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-white/5 z-10">
          {/* Mobile toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-md lg:text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {location.pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>

          {/* Right Top Header Tools */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800/60 dark:text-slate-400 transition-all duration-200 transform active:scale-95"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Blood Group Indicator for Donors */}
            {user?.role === 'donor' && user.bloodGroup && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-blood font-bold text-xs rounded-xl border border-red-100/50 dark:border-red-950/30">
                <Droplet className="h-4 w-4 fill-current" />
                <span>{user.bloodGroup}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
