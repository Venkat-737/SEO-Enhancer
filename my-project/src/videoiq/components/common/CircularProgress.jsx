import { motion } from 'framer-motion';

export default function CircularProgress({ 
  value = 0, 
  size = 120, 
  strokeWidth = 8, 
  color = '#818cf8',
  label = '',
  sublabel = '' 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          className="viq-circular-progress" 
          width={size} 
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            className="viq-circular-progress-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            className="viq-circular-progress-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'none' }}
        >
          <motion.span 
            className="text-2xl font-bold"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--viq-text-primary)' }}>{label}</p>
          {sublabel && (
            <p className="text-xs" style={{ color: 'var(--viq-text-tertiary)' }}>{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
