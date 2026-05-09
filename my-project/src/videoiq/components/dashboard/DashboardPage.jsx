import { motion } from 'framer-motion';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import SEOOverview from './SEOOverview';
import PerformanceCharts from './PerformanceCharts';
import KeywordCharts from './KeywordCharts';
import TranscriptViewer from './TranscriptViewer';
import GeneratedTitles from './GeneratedTitles';
import GeneratedDescription from './GeneratedDescription';
import FrameGallery from './FrameGallery';

export default function DashboardPage({ data, onBack }) {
  const {
    transcript = '',
    generated_content = {},
    seo_analysis = {},
    performance_prediction = {},
    frame_insights = {},
  } = data || {};

  // Extract generated content fields
  const titles = generated_content.titles || [];
  const description = generated_content.description || '';
  const hashtags = generated_content.hashtags || [];
  const tags = generated_content.tags || [];

  // Extract SEO analysis fields
  const keywords = seo_analysis.keywords || [];

  return (
    <motion.div
      className="space-y-8 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            className="viq-btn-ghost p-2"
            onClick={onBack}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--viq-text-primary)' }}>
              Analysis Results
            </h2>
            <p className="text-sm" style={{ color: 'var(--viq-text-tertiary)' }}>
              AI-powered SEO insights for your video
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="viq-btn-ghost text-xs">
            <Download size={14} /> Export
          </button>
          <button className="viq-btn-ghost text-xs" onClick={onBack}>
            <RefreshCw size={14} /> New Analysis
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <SEOOverview
        seoAnalysis={seo_analysis}
        prediction={performance_prediction}
        generatedContent={generated_content}
      />

      {/* Performance Charts — breakdown, predicted_views, reach_probability */}
      <PerformanceCharts prediction={performance_prediction} />

      {/* Keyword Analysis — keywords with 0-1 scores, sentiment, topics */}
      <KeywordCharts keywords={keywords} seoAnalysis={seo_analysis} />

      {/* Generated Content — titles, description, hashtags, tags */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GeneratedTitles titles={titles} />
        <GeneratedDescription
          description={description}
          hashtags={hashtags}
          tags={tags}
        />
      </div>

      {/* Transcript */}
      <TranscriptViewer transcript={transcript} />

      {/* Frame Gallery — frame_paths[], duration_sec, fps, resolution */}
      <FrameGallery frameInsights={frame_insights} />
    </motion.div>
  );
}
