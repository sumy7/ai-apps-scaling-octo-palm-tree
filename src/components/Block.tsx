import { motion } from 'framer-motion';
import type { BlockColor } from '../store/gameStore';

interface BlockProps {
  color: BlockColor;
  onClick?: () => void;
  clickable?: boolean;
  size?: 'normal' | 'small';
  eliminatedCount?: number;
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
  size = 'normal',
  eliminatedCount
}) => {
  const sizeValue = size === 'normal' ? 44 : 36;
  
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
      {eliminatedCount !== undefined && eliminatedCount > 0 && (
        <span style={{
          position: 'absolute',
          bottom: -4,
          right: -4,
          backgroundColor: '#1f2937',
          color: 'white',
          fontSize: 12,
          fontWeight: 'bold',
          width: 18,
          height: 18,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid white',
        }}>
          {eliminatedCount}
        </span>
      )}
    </motion.div>
  );
};
