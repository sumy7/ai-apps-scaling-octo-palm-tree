import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Block } from './Block';
import './Game.css';

export const Game: React.FC = () => {
  const { areaA, areaB, areaC, gameStatus, initGame, clickAreaC } = useGameStore();

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleAreaCClick = (col: number) => {
    clickAreaC(col);
  };

  const handleRestart = () => {
    initGame();
  };

  // Find the maximum row count in Area A for proper grid display
  const maxAreaARows = Math.max(...areaA.map(col => col.length), 1);

  return (
    <div className="game-container">
      <h1 className="game-title">消除游戏</h1>
      
      {/* Game Status */}
      {gameStatus !== 'playing' && (
        <div className={`game-status ${gameStatus}`}>
          {gameStatus === 'won' ? '🎉 胜利！' : '😢 游戏结束'}
          <button className="restart-btn" onClick={handleRestart}>
            重新开始
          </button>
        </div>
      )}

      {/* Area A - Blocks to be eliminated */}
      <div className="area area-a">
        <h2>区域 A - 待消除</h2>
        <div className="area-content" style={{ gridTemplateColumns: `repeat(${areaA.length}, 1fr)` }}>
          {areaA.map((column, colIndex) => (
            <div key={colIndex} className="column">
              {/* Render from top to bottom, but blocks are stored bottom-up */}
              {Array.from({ length: maxAreaARows }).map((_, rowIndex) => {
                // Calculate the actual index in the column (reverse order for display)
                const actualIndex = maxAreaARows - 1 - rowIndex;
                const block = actualIndex < column.length ? column[column.length - 1 - actualIndex] : null;
                
                return (
                  <div key={rowIndex} className="cell">
                    <AnimatePresence mode="popLayout">
                      {block && (
                        <Block 
                          key={block.id} 
                          color={block.color} 
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="bottom-indicator">⬇️ 只能消除最下面一行</div>
      </div>

      {/* Area B - Temporary storage */}
      <div className="area area-b">
        <h2>区域 B - 暂存区</h2>
        <div className="area-b-content">
          {areaB.map((block, index) => (
            <div key={index} className="cell">
              <AnimatePresence mode="popLayout">
                {block && (
                  <Block 
                    key={block.id} 
                    color={block.color}
                    size="small"
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="capacity-hint">容量: {areaB.filter(b => b !== null).length}/{areaB.length}</div>
      </div>

      {/* Area C - Blocks to use */}
      <div className="area area-c">
        <h2>区域 C - 消除用方块</h2>
        <div className="top-indicator">⬆️ 点击第一行的方块</div>
        <div className="area-content" style={{ gridTemplateColumns: `repeat(${areaC.length}, 1fr)` }}>
          {areaC.map((column, colIndex) => (
            <div key={colIndex} className="column">
              {column.map((block, rowIndex) => (
                <div key={rowIndex} className="cell">
                  <AnimatePresence mode="popLayout">
                    {block && (
                      <Block 
                        key={block.id} 
                        color={block.color}
                        clickable={rowIndex === 0 && gameStatus === 'playing'}
                        onClick={() => rowIndex === 0 && handleAreaCClick(colIndex)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Game instructions */}
      <div className="instructions">
        <h3>游戏规则</h3>
        <ul>
          <li>点击区域 C 最上面一行的方块，将其移动到暂存区 B</li>
          <li>暂存区 B 的方块可以消除区域 A 最下面一行的 3 个相同颜色的方块</li>
          <li>区域 A 的方块消除后，上方方块会自动下落补位</li>
          <li>区域 C 的方块被取走后，下方方块会自动上移补位</li>
          <li>胜利条件：所有区域都没有方块</li>
          <li>失败条件：暂存区 B 被填满且无法消除</li>
        </ul>
      </div>

      {/* Restart button when playing */}
      {gameStatus === 'playing' && (
        <button className="restart-btn playing" onClick={handleRestart}>
          重新开始
        </button>
      )}
    </div>
  );
};
