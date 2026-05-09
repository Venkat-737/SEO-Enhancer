import { motion } from 'framer-motion';
import { Image, Maximize2, X, Monitor, Clock, Film } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../common/GlassCard';
import SectionHeader from '../common/SectionHeader';

const BACKEND_URL = 'http://localhost:5000';

export default function FrameGallery({ frameInsights = {} }) {
  const [selectedFrame, setSelectedFrame] = useState(null);

  const {
    frame_paths = [],
    frames_extracted = 0,
    duration_sec = 0,
    fps = 0,
    resolution = 'N/A',
  } = frameInsights;

  if (!frame_paths.length) return null;

  // Convert backend relative paths to full URLs
  const getFrameUrl = (path) => {
    // Normalize backslashes to forward slashes and prepend backend URL
    const normalized = path.replace(/\\/g, '/');
    return `${BACKEND_URL}/${normalized}`;
  };

  // Extract frame number from filename for label
  const getFrameLabel = (path, index) => {
    const match = path.match(/frame_(\d+)/);
    if (match) {
      const frameNum = parseInt(match[1]);
      const seconds = fps > 0 ? (frameNum / fps).toFixed(1) : frameNum;
      return `${seconds}s`;
    }
    return `Frame ${index + 1}`;
  };

  return (
    <>
      <GlassCard delay={0.6}>
        <div className="flex items-center justify-between mb-2">
          <SectionHeader
            icon={Image}
            title="Extracted Frames"
            subtitle={`${frames_extracted} key frames from video`}
            accent="#fb7185"
          />
        </div>

        {/* Video Meta Info */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: 'var(--viq-text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--viq-text-secondary)' }}>
              Duration: {duration_sec.toFixed(1)}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Film size={14} style={{ color: 'var(--viq-text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--viq-text-secondary)' }}>
              FPS: {fps}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor size={14} style={{ color: 'var(--viq-text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--viq-text-secondary)' }}>
              Resolution: {resolution}
            </span>
          </div>
        </div>

        <div className="viq-frame-gallery">
          {frame_paths.map((framePath, i) => {
            const url = getFrameUrl(framePath);
            const label = getFrameLabel(framePath, i);
            return (
              <motion.div
                key={i}
                className="viq-frame-item group cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedFrame(url)}
              >
                <img
                  src={url}
                  alt={`Frame at ${label}`}
                  onError={(e) => {
                    // Replace broken image with an SVG placeholder
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml,${encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="%230f1424"/><rect x="120" y="50" width="80" height="80" rx="12" fill="%23818cf820" stroke="%23818cf840" stroke-width="1"/><text x="160" y="98" font-family="Inter,system-ui,sans-serif" font-size="24" fill="%23818cf8" text-anchor="middle">▶</text><text x="160" y="150" font-family="Inter,system-ui,sans-serif" font-size="12" fill="%2394a3b8" text-anchor="middle">${label}</text></svg>`
                    )}`;
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(6,8,15,0.6)' }}
                >
                  <Maximize2 size={20} color="white" />
                </div>
                {/* Timestamp Label */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                  style={{ background: 'rgba(6, 8, 15, 0.8)' }}
                >
                  <p className="text-[11px] font-mono" style={{ color: 'var(--viq-text-secondary)' }}>
                    ⏱ {label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Lightbox */}
      {selectedFrame && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedFrame(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 p-2 rounded-lg hover:bg-white/10"
              onClick={() => setSelectedFrame(null)}
            >
              <X size={20} color="white" />
            </button>
            <img
              src={selectedFrame}
              alt="Full frame"
              className="w-full rounded-xl"
              style={{ border: '1px solid var(--viq-border-default)' }}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}
