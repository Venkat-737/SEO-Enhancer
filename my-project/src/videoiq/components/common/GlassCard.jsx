import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true,
  animate = true,
  ...props 
}) {
  if (!animate) {
    return (
      <div className={`viq-glass-static p-6 ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`${hover ? 'viq-glass' : 'viq-glass-static'} p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
