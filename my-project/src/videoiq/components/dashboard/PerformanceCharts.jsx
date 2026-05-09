import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Activity, Gauge } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import SectionHeader from '../common/SectionHeader';
import CircularProgress from '../common/CircularProgress';

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
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#818cf8', '#22d3ee', '#34d399', '#fbbf24'];

export default function PerformanceCharts({ prediction = {} }) {
  const {
    seo_score = 0,
    virality_score = 0,
    predicted_views = 'N/A',
    reach_probability = 'Low',
    breakdown = {},
  } = prediction;

  const {
    keyword_score = 0,
    length_score = 0,
    sentiment_score = 0,
    title_ctr_score = 0,
  } = breakdown;

  // Breakdown bar chart data
  const breakdownData = [
    { name: 'Keyword', score: keyword_score, fill: '#818cf8' },
    { name: 'Length', score: length_score, fill: '#22d3ee' },
    { name: 'Sentiment', score: sentiment_score, fill: '#34d399' },
    { name: 'Title CTR', score: title_ctr_score, fill: '#fbbf24' },
  ];

  // Pie chart for score composition
  const pieData = breakdownData.filter(d => d.score > 0);

  return (
    <div className="space-y-6">
      {/* Circular Progress Row */}
      <GlassCard delay={0.2}>
        <SectionHeader
          icon={Activity}
          title="Performance Prediction"
          subtitle="AI-estimated video performance metrics"
          accent="#22d3ee"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          <CircularProgress
            value={Math.min(seo_score, 100)}
            color="#818cf8"
            label="SEO Score"
            sublabel={`${seo_score}/100`}
          />
          <CircularProgress
            value={Math.min(virality_score, 100)}
            color="#fbbf24"
            label="Virality"
            sublabel="Share potential"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className="w-[120px] h-[120px] rounded-full flex flex-col items-center justify-center"
              style={{
                background: 'rgba(34, 211, 238, 0.08)',
                border: '2px solid rgba(34, 211, 238, 0.25)',
              }}
            >
              <motion.span
                className="text-xl font-bold"
                style={{ color: '#22d3ee' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                {predicted_views}
              </motion.span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--viq-text-primary)' }}>Est. Views</p>
              <p className="text-xs" style={{ color: 'var(--viq-text-tertiary)' }}>14-day range</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className="w-[120px] h-[120px] rounded-full flex flex-col items-center justify-center"
              style={{
                background: reach_probability === 'High' ? 'rgba(52, 211, 153, 0.08)' :
                  reach_probability === 'Medium' ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 113, 133, 0.08)',
                border: `2px solid ${reach_probability === 'High' ? 'rgba(52, 211, 153, 0.25)' :
                  reach_probability === 'Medium' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 113, 133, 0.25)'}`,
              }}
            >
              <motion.span
                className="text-xl font-bold"
                style={{
                  color: reach_probability === 'High' ? '#34d399' :
                    reach_probability === 'Medium' ? '#fbbf24' : '#fb7185',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                {reach_probability}
              </motion.span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--viq-text-primary)' }}>Reach</p>
              <p className="text-xs" style={{ color: 'var(--viq-text-tertiary)' }}>Probability</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown Bar Chart */}
        <GlassCard delay={0.3}>
          <SectionHeader
            icon={Gauge}
            title="Score Breakdown"
            subtitle="Individual scoring components"
            accent="#818cf8"
          />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {breakdownData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Score Composition Pie */}
        <GlassCard delay={0.4}>
          <SectionHeader
            icon={Activity}
            title="Score Composition"
            subtitle={`Total SEO Score: ${seo_score}/100`}
            accent="#34d399"
          />
          <div style={{ height: 260 }} className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="score"
                  nameKey="name"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {breakdownData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                <span className="text-xs" style={{ color: 'var(--viq-text-secondary)' }}>
                  {item.name}: {item.score}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
