import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Scan, FileText, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';

const steps = [
  { icon: Scan, text: 'Extracting video frames...', color: '#22d3ee' },
  { icon: FileText, text: 'Transcribing audio...', color: '#818cf8' },
  { icon: Brain, text: 'Running AI analysis...', color: '#a78bfa' },
  { icon: BarChart3, text: 'Computing SEO metrics...', color: '#34d399' },
  { icon: Sparkles, text: 'Generating recommendations...', color: '#fbbf24' },
];

export default function LoadingScreen({ progress = 0 }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const idx = Math.min(Math.floor(progress / 20), steps.length - 1);
    setCurrentStep(idx);
  }, [progress]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      {/* Spinning Logo */}
      <motion.div
        className="relative mb-12"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <motion.div
          className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(34, 211, 238, 0.2))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
          animate={{
            boxShadow: [
              '0 0 30px rgba(99, 102, 241, 0.2)',
              '0 0 60px rgba(99, 102, 241, 0.4)',
              '0 0 30px rgba(99, 102, 241, 0.2)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain size={48} style={{ color: '#818cf8' }} />
        </motion.div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: ['#818cf8', '#22d3ee', '#a78bfa'][i],
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [
                Math.cos((i * 120 * Math.PI) / 180) * 60,
                Math.cos(((i * 120 + 360) * Math.PI) / 180) * 60,
              ],
              y: [
                Math.sin((i * 120 * Math.PI) / 180) * 60,
                Math.sin(((i * 120 + 360) * Math.PI) / 180) * 60,
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Step Indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            const StepIcon = steps[currentStep].icon;
            return (
              <StepIcon size={20} style={{ color: steps[currentStep].color }} />
            );
          })()}
          <span className="text-base font-medium" style={{ color: 'var(--viq-text-secondary)' }}>
            {steps[currentStep].text}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="viq-progress-bar">
          <motion.div
            className="viq-progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-3">
          <span className="text-xs" style={{ color: 'var(--viq-text-tertiary)' }}>
            Analyzing...
          </span>
          <span className="text-xs font-mono font-semibold" style={{ color: 'var(--viq-accent-primary)' }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Step Dots */}
      <div className="flex gap-2 mt-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: i <= currentStep ? step.color : 'rgba(99, 102, 241, 0.2)',
            }}
            animate={i === currentStep ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}
