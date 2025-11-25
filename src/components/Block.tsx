import { motion } from 'framer-motion';
import type { BlockColor } from '../store/gameStore';

interface BlockProps {
  color: BlockColor;
  onClick?: () => void;
  clickable?: boolean;
  size?: 'normal' | 'small';
}

const colorMap: Record<BlockColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
};

export const Block: React.FC<BlockProps> = ({ 
  color, 
  onClick, 
  clickable = false,
  size = 'normal'
}) => {
  const sizeValue = size === 'normal' ? 50 : 40;
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      whileHover={clickable ? { scale: 1.1 } : undefined}
      whileTap={clickable ? { scale: 0.95 } : undefined}
      onClick={onClick}
      style={{
        width: sizeValue,
        height: sizeValue,
        backgroundColor: colorMap[color],
        borderRadius: 8,
        cursor: clickable ? 'pointer' : 'default',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255,255,255,0.3)',
      }}
    />
  );
};
