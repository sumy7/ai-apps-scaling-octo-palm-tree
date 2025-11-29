import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { Block as BlockType } from '../store/gameStore';
import { Block } from './Block';
import './Game.css';

// Fixed display rows for Area A and C
const DISPLAY_ROWS = 5;

/**
 * Gets the block at a specific display position in Area A.
 * Shows bottom rows (blocks at bottom of array)
 */
const getBlockAtAreaADisplayPosition = (
  column: (BlockType | null)[],
  rowIndex: number
): BlockType | null => {
  // rowIndex 0 = top of display area, we want to show from bottom
  // If column has 10 blocks and we show 5 rows:
  // rowIndex 0 should show column[5] (6th from bottom)
  // rowIndex 4 should show column[9] (last/bottom block)
  const startIndex = Math.max(0, column.length - DISPLAY_ROWS);
  const actualIndex = startIndex + rowIndex;
  return actualIndex < column.length ? column[actualIndex] : null;
};

/**
 * Gets the block at a specific display position in Area C.
 * Shows top rows (blocks at top of array)
 */
const getBlockAtAreaCDisplayPosition = (
  column: (BlockType | null)[],
  rowIndex: number
): BlockType | null => {
  // rowIndex 0 = top row, show first blocks
  return rowIndex < column.length ? column[rowIndex] : null;
};

export const Game: React.FC = () => {
  const { areaA, areaB, areaC, gameStatus, initGame, clickAreaC } = useGameStore();
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleAreaCClick = (col: number) => {
    clickAreaC(col);
  };

  const handleRestart = () => {
    initGame();
  };

  // Count blocks in each area
  const areaACount = areaA.reduce((sum, col) => sum + col.length, 0);
  const areaCCount = areaC.reduce((sum, col) => sum + col.length, 0);
  const areaBCount = areaB.filter(b => b !== null).length;

  // Check if there are hidden blocks above Area A
  const hasHiddenAbove = areaA.some(col => col.length > DISPLAY_ROWS);
  // Check if there are hidden blocks below Area C
  const hasHiddenBelow = areaC.some(col => col.length > DISPLAY_ROWS);

  return (
    <div className="game-container">
      {/* Header with title and controls */}
      <header className="game-header">
        <h1 className="game-title">🎮 消除游戏</h1>
        <div className="header-controls">
          <button 
            className="help-toggle" 
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? '隐藏规则' : '显示规则'}
          </button>
          <button className="restart-btn" onClick={handleRestart}>
            重新开始
          </button>
        </div>
      </header>
      
      {/* Game Status Overlay */}
      {gameStatus !== 'playing' && (
        <div className={`game-status ${gameStatus}`}>
          {gameStatus === 'won' ? '🎉 胜利！' : '😢 游戏结束'}
          <button className="restart-btn" onClick={handleRestart}>
            重新开始
          </button>
        </div>
      )}

      {/* Main Game Content */}
      <main className="game-main">
        {/* Game Board - Vertical Layout */}
        <div className="game-board">
          {/* Area A - Blocks to be eliminated (Top) */}
          <div className="area area-a">
            <div className="area-header">
              <h2>区域 A · 待消除</h2>
              <span className="area-badge">{areaACount} 个</span>
            </div>
            {hasHiddenAbove && (
              <div className="overflow-indicator top">⬆️ 还有更多方块</div>
            )}
            <div className="area-content-wrapper">
              <div className="area-content" style={{ gridTemplateColumns: `repeat(${areaA.length}, 1fr)` }}>
                {areaA.map((column, colIndex) => (
                  <div key={colIndex} className="column">
                    {Array.from({ length: DISPLAY_ROWS }).map((_, rowIndex) => {
                      const block = getBlockAtAreaADisplayPosition(column, rowIndex);
                      
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
            </div>
            <div className="bottom-indicator">⬇️ 只能消除最下面一行</div>
          </div>

          {/* Area B - Temporary storage (Middle) */}
          <div className="area area-b">
            <div className="area-header">
              <h2>暂存区 B</h2>
              <span className="area-badge">{areaBCount}/{areaB.length}</span>
            </div>
            <div className="area-b-content">
              {areaB.map((block, index) => (
                <div key={index} className="cell">
                  <AnimatePresence mode="popLayout">
                    {block && (
                      <Block 
                        key={block.id} 
                        color={block.color}
                        size="small"
                        eliminatedCount={block.eliminatedCount}
                        showRemaining={true}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="capacity-hint">
              {areaBCount === areaB.length ? '⚠️ 暂存区已满' : `还可放 ${areaB.length - areaBCount} 个`}
            </div>
          </div>

          {/* Area C - Blocks to use (Bottom) */}
          <div className="area area-c">
            <div className="area-header">
              <h2>区域 C · 消除用</h2>
              <span className="area-badge">{areaCCount} 个</span>
            </div>
            <div className="top-indicator">⬆️ 点击第一行的方块</div>
            <div className="area-content-wrapper">
              <div className="area-content" style={{ gridTemplateColumns: `repeat(${areaC.length}, 1fr)` }}>
                {areaC.map((column, colIndex) => (
                  <div key={colIndex} className="column">
                    {Array.from({ length: DISPLAY_ROWS }).map((_, rowIndex) => {
                      const block = getBlockAtAreaCDisplayPosition(column, rowIndex);
                      
                      return (
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
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {hasHiddenBelow && (
              <div className="overflow-indicator bottom">⬇️ 还有更多方块</div>
            )}
          </div>
        </div>

        {/* Instructions Panel (Right Sidebar) */}
        <aside className={`instructions-panel ${showInstructions ? '' : 'collapsed'}`}>
          <div className="instructions">
            <h3>📖 游戏规则</h3>
            <ul>
              <li>点击区域 C 最上面一行的方块，将其移动到暂存区 B</li>
              <li>暂存区 B 的方块可以逐个消除区域 A 最下面一行的相同颜色方块</li>
              <li>暂存区 B 的方块消除 3 个区域 A 的方块后，会从暂存区移除</li>
              <li>区域 A 的方块消除后，上方方块会自动下落补位</li>
              <li>区域 C 的方块被取走后，下方方块会自动上移补位</li>
              <li>胜利条件：所有区域都没有方块</li>
              <li>失败条件：暂存区 B 被填满且无法消除</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
};
