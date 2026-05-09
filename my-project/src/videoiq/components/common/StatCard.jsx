import { motion } from 'framer-motion';

const colorMap = {
  indigo: { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' },
  cyan: { bg: 'rgba(34, 211, 238, 0.15)', color: '#22d3ee' },
  emerald: { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399' },
  rose: { bg: 'rgba(251, 113, 133, 0.15)', color: '#fb7185' },
  amber: { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' },
  violet: { bg: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' },
};

export default function StatCard({ icon: Icon, title, value, subtitle, accent = 'indigo', delay = 0 }) {
  const scheme = colorMap[accent] || colorMap.indigo;

  return (
    <motion.div
      className="viq-glass p-5 flex items-start gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div
        className="viq-icon-container"
        style={{ background: scheme.bg, color: scheme.color }}
      >
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--viq-text-tertiary)' }}>
          {title}
        </p>
        <motion.p
          className="text-2xl font-bold mb-0.5"
          style={{ color: 'var(--viq-text-primary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {value}
        </motion.p>
        {subtitle && (
          <p className="text-xs" style={{ color: scheme.color }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
