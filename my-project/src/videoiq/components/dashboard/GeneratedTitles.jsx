import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../common/GlassCard';
import SectionHeader from '../common/SectionHeader';

export default function GeneratedTitles({ titles = [] }) {
  const [copiedIdx, setCopiedIdx] = useState(-1);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 2000);
  };

  if (!titles.length) return null;

  return (
    <GlassCard delay={0.3}>
      <SectionHeader
        icon={Sparkles}
        title="AI Generated Titles"
        subtitle="Optimized for YouTube SEO"
        accent="#fbbf24"
      />
      <div className="space-y-3">
        {titles.map((title, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl transition-all group"
            style={{
              background: 'rgba(6, 8, 15, 0.4)',
              border: '1px solid var(--viq-border-subtle)',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{
              background: 'rgba(99, 102, 241, 0.06)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(251, 191, 36, 0.1)' }}
            >
              <Lightbulb size={14} style={{ color: '#fbbf24' }} />
            </div>
            <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--viq-text-secondary)' }}>
              {title}
            </p>
            <motion.button
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 transition-all flex-shrink-0"
              onClick={() => handleCopy(title, i)}
              whileTap={{ scale: 0.9 }}
            >
              {copiedIdx === i ? (
                <Check size={14} style={{ color: '#34d399' }} />
              ) : (
                <Copy size={14} style={{ color: 'var(--viq-text-tertiary)' }} />
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
