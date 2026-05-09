import { motion } from 'framer-motion';
import { FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../common/GlassCard';
import SectionHeader from '../common/SectionHeader';

export default function TranscriptViewer({ transcript }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!transcript) return null;

  return (
    <GlassCard delay={0.2}>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader
          icon={FileText}
          title="Video Transcript"
          subtitle="Auto-generated from audio"
          accent="#22d3ee"
        />
        <motion.button
          className="viq-btn-ghost text-xs"
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>
      <div className="viq-transcript">
        {transcript.split('\n').map((line, i) => (
          <motion.p
            key={i}
            className="mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
          >
            {line || '\u00A0'}
          </motion.p>
        ))}
      </div>
    </GlassCard>
  );
}
