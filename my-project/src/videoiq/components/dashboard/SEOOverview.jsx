import { BarChart3, Eye, TrendingUp, Target, Zap, ThermometerSun, Hash, MessageCircle } from 'lucide-react';
import StatCard from '../common/StatCard';

export default function SEOOverview({ seoAnalysis = {}, prediction = {}, generatedContent = {} }) {
  const {
    sentiment = 'N/A',
    sentiment_score = 0,
    keywords = [],
    topics = [],
  } = seoAnalysis;

  const {
    seo_score = 0,
    virality_score = 0,
    predicted_views = 'N/A',
    reach_probability = 'N/A',
    breakdown = {},
  } = prediction;

  const { tags = [], hashtags = [] } = generatedContent;

  const sentimentLabel = sentiment === 'POSITIVE' ? 'Positive' : sentiment === 'NEGATIVE' ? 'Negative' : 'Neutral';
  const sentimentColor = sentiment === 'POSITIVE' ? 'emerald' : sentiment === 'NEGATIVE' ? 'rose' : 'amber';

  const stats = [
    { icon: BarChart3, title: 'SEO Score', value: `${seo_score}/100`, subtitle: seo_score >= 60 ? 'Good optimization' : 'Needs improvement', accent: 'indigo' },
    { icon: Eye, title: 'Predicted Views', value: predicted_views, subtitle: `Reach: ${reach_probability}`, accent: 'cyan' },
    { icon: TrendingUp, title: 'Virality Score', value: `${virality_score}/100`, subtitle: virality_score >= 50 ? 'Viral potential' : 'Limited reach', accent: 'emerald' },
    { icon: Target, title: 'Title CTR', value: `${breakdown.title_ctr_score || 0}`, subtitle: 'Title click-through score', accent: 'rose' },
    { icon: Zap, title: 'Keywords Found', value: keywords.length, subtitle: `${topics.length} topics detected`, accent: 'amber' },
    { icon: ThermometerSun, title: 'Sentiment', value: sentimentLabel, subtitle: `Score: ${(sentiment_score * 100).toFixed(1)}%`, accent: sentimentColor },
    { icon: Hash, title: 'Tags Generated', value: tags.length, subtitle: `${hashtags.length} hashtags`, accent: 'violet' },
    { icon: MessageCircle, title: 'Keyword Score', value: `${breakdown.keyword_score || 0}`, subtitle: 'Content relevance', accent: 'indigo' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.title} {...stat} delay={i * 0.08} />
      ))}
    </div>
  );
}
