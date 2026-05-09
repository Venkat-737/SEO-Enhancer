import { motion } from 'framer-motion';
import {
  Brain,
  Upload,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { id: 'upload', icon: Upload, label: 'Upload Video', accent: '#22d3ee' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', accent: '#818cf8' },
];

const bottomItems = [
  { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      <aside className={`viq-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Brain size={22} color="white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--viq-text-primary)' }}>
                VideoIQ
              </h1>
              <div className="flex items-center gap-1">
                <Sparkles size={10} style={{ color: '#818cf8' }} />
                <span className="text-[10px] font-medium" style={{ color: 'var(--viq-text-tertiary)' }}>
                  AI-Powered SEO
                </span>
              </div>
            </div>
          </motion.div>

          {/* Close button on mobile */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={onClose}
          >
            <X size={18} style={{ color: 'var(--viq-text-tertiary)' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-3"
            style={{ color: 'var(--viq-text-tertiary)' }}>
            Main Menu
          </p>
          {navItems.map((item, idx) => {
            const isActive = activePage === item.id;
            return (
              <motion.button
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: isActive ? 'var(--viq-accent-primary)' : 'var(--viq-text-secondary)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                }}
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t pt-4 space-y-1" style={{ borderColor: 'var(--viq-border-subtle)' }}>
          {bottomItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
              style={{ color: 'var(--viq-text-tertiary)' }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}

          {/* User Avatar */}
          <div className="flex items-center gap-3 px-3 py-3 mt-4 rounded-xl"
            style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--viq-border-subtle)' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', color: 'white' }}
            >
              V
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--viq-text-primary)' }}>
                VideoIQ User
              </p>
              <p className="text-[11px] truncate" style={{ color: 'var(--viq-text-tertiary)' }}>
                Pro Plan
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
