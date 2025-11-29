import { motion, type Variants } from 'framer-motion';
import type { BlockColor } from '../store/gameStore';

interface BlockProps {
  color: BlockColor;
  onClick?: () => void;
  clickable?: boolean;
  size?: 'normal' | 'small';
  eliminatedCount?: number;
  showRemaining?: boolean; // Show remaining eliminations instead of count
}

const colorMap: Record<BlockColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
};

// Animation variants for different block behaviors
const blockVariants: Variants = {
  initial: { 
    scale: 0, 
    opacity: 0,
    y: -20 
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
};

export const Block: React.FC<BlockProps> = ({ 
  color, 
  onClick, 
  clickable = false,
  size = 'normal',
  eliminatedCount,
  showRemaining = false
}) => {
  const sizeValue = size === 'normal' ? 44 : 36;
  const MAX_ELIMINATIONS = 3;
  const remaining = MAX_ELIMINATIONS - (eliminatedCount || 0);
  
  return (
    <motion.div
      variants={blockVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      whileHover={clickable ? { scale: 1.1 } : undefined}
      whileTap={clickable ? { scale: 0.95 } : undefined}
      onClick={onClick}
      style={{
        width: sizeValue,
        height: sizeValue,
        backgroundColor: colorMap[color],
        borderRadius: 8,
        cursor: clickable ? 'pointer' : 'default',
        boxShadow: clickable 
          ? '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' 
          : '0 2px 4px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'box-shadow 0.2s',
      }}
    >
      {showRemaining && remaining > 0 && (
        <span style={{
          color: 'white',
          fontSize: size === 'small' ? 14 : 16,
          fontWeight: 'bold',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}>
          {remaining}
        </span>
      )}
    </motion.div>
  );
};
