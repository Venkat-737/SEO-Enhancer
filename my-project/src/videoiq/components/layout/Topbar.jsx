import { Menu, Bell, Search } from 'lucide-react';

export default function Topbar({ onMenuToggle, pageTitle = 'Dashboard' }) {
  return (
    <div className="viq-topbar">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-white/5"
          onClick={onMenuToggle}
        >
          <Menu size={20} style={{ color: 'var(--viq-text-secondary)' }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--viq-text-primary)' }}>
            {pageTitle}
          </h1>
          <p className="text-xs" style={{ color: 'var(--viq-text-tertiary)' }}>
            AI-Powered YouTube SEO Analysis
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(15, 20, 40, 0.6)',
            border: '1px solid var(--viq-border-subtle)',
          }}
        >
          <Search size={14} style={{ color: 'var(--viq-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-36"
            style={{ color: 'var(--viq-text-secondary)', fontFamily: 'var(--viq-font-sans)' }}
          />
        </div>

        {/* Notification */}
        <button
          className="relative p-2 rounded-xl transition-colors hover:bg-white/5"
          style={{ border: '1px solid var(--viq-border-subtle)' }}
        >
          <Bell size={18} style={{ color: 'var(--viq-text-secondary)' }} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#fb7185' }}
          />
        </button>
      </div>
    </div>
  );
}
