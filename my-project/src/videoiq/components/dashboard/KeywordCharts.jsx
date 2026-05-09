import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Tags, TrendingUp } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import SectionHeader from '../common/SectionHeader';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-xl"
        style={{
          background: 'rgba(15, 20, 40, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--viq-text-primary)' }}>
          {label}
        </p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color || '#818cf8' }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function KeywordCharts({ keywords = [], seoAnalysis = {} }) {
  const { sentiment = 'N/A', sentiment_score = 0, topics = [] } = seoAnalysis;

  // Format keywords for bar chart — API returns {keyword, score} where score is 0-1 decimal
  const keywordData = keywords.slice(0, 10).map((kw) => ({
    name: typeof kw === 'string' ? kw : (kw.keyword || ''),
    score: typeof kw === 'object' ? (kw.score || 0) : 0,
    // Convert to percentage for display
    pct: typeof kw === 'object' ? Math.round((kw.score || 0) * 100) : 0,
  }));

  // Build radar data from the performance breakdown if passed, otherwise from keyword categories
  // Group first word of each keyword for radar categories
  const radarMap = {};
  keywords.forEach((kw) => {
    const word = (kw.keyword || '').split(' ')[0];
    if (word && !radarMap[word]) {
      radarMap[word] = Math.round((kw.score || 0) * 100);
    }
  });
  const radarData = Object.entries(radarMap).slice(0, 8).map(([metric, score]) => ({
    metric,
    score,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Keyword Relevance Bar Chart */}
      <GlassCard delay={0.4}>
        <SectionHeader
          icon={Tags}
          title="Keyword Analysis"
          subtitle={`Top ${keywordData.length} keyword relevance scores`}
          accent="#34d399"
        />
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={keywordData} margin={{ top: 10, right: 10, bottom: 30, left: -10 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.06)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#64748b' }}
                domain={[0, 1]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                name="Relevance"
                fill="url(#barGradient)"
                radius={[0, 6, 6, 0]}
                maxBarSize={24}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* SEO Radar Chart + Topics & Sentiment */}
      <GlassCard delay={0.5}>
        <SectionHeader
          icon={TrendingUp}
          title="Keyword Radar"
          subtitle="Multi-dimensional keyword distribution"
          accent="#818cf8"
        />
        {radarData.length >= 3 ? (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99, 102, 241, 0.15)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  domain={[0, 100]}
                  axisLine={false}
                />
                <Radar
                  name="Relevance %"
                  dataKey="score"
                  stroke="#818cf8"
                  fill="#818cf8"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-sm" style={{ color: 'var(--viq-text-tertiary)' }}>Not enough keywords for radar chart</p>
          </div>
        )}

        {/* Sentiment & Topics */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--viq-border-subtle)' }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium" style={{ color: 'var(--viq-text-tertiary)' }}>Sentiment:</span>
            <span
              className={`viq-tag ${sentiment === 'POSITIVE' ? 'viq-tag-emerald' : sentiment === 'NEGATIVE' ? 'viq-tag-rose' : 'viq-tag-amber'}`}
            >
              {sentiment} ({(sentiment_score * 100).toFixed(1)}%)
            </span>
          </div>
          {topics.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium" style={{ color: 'var(--viq-text-tertiary)' }}>Topics:</span>
              {topics.map((topic, i) => (
                <span key={i} className="viq-tag viq-tag-cyan">{topic}</span>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
