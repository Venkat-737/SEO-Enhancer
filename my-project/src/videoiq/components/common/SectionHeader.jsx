import { motion } from 'framer-motion';

export default function SectionHeader({ icon: Icon, title, subtitle, accent = '#818cf8' }) {
  return (
    <motion.div 
      className="flex items-center gap-3 mb-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {Icon && (
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}20`, color: accent }}
        >
          <Icon size={20} />
        </div>
      )}
      <div>
        <h2 className="viq-section-title">{title}</h2>
        {subtitle && <p className="viq-section-subtitle">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
