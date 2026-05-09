import { motion } from 'framer-motion';
import { PenTool, Copy, Check, Hash, Tag } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../common/GlassCard';
import SectionHeader from '../common/SectionHeader';

export default function GeneratedDescription({ description = '', hashtags = [], tags = [] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = [
      description,
      '',
      hashtags.length ? hashtags.join(' ') : '',
      '',
      tags.length ? 'Tags: ' + tags.join(', ') : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!description && !hashtags.length && !tags.length) return null;

  return (
    <GlassCard delay={0.35}>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader
          icon={PenTool}
          title="AI Generated Description"
          subtitle="SEO-optimized video description"
          accent="#a78bfa"
        />
        <motion.button
          className="viq-btn-ghost text-xs"
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy All'}
        </motion.button>
      </div>

      {/* Description Text */}
      {description && (
        <motion.div
          className="p-5 rounded-xl mb-4"
          style={{
            background: 'rgba(6, 8, 15, 0.5)',
            border: '1px solid var(--viq-border-subtle)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p
            className="text-sm leading-7 whitespace-pre-wrap"
            style={{ color: 'var(--viq-text-secondary)' }}
          >
            {description}
          </p>
        </motion.div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash size={14} style={{ color: '#22d3ee' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--viq-text-tertiary)' }}>
              Hashtags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((ht, i) => (
              <motion.span
                key={i}
                className="viq-tag viq-tag-cyan"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                {ht}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag size={14} style={{ color: '#818cf8' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--viq-text-tertiary)' }}>
              Suggested Tags ({tags.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <motion.span
                key={i}
                className="viq-tag viq-tag-indigo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
