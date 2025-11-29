import { create } from 'zustand';

// Block colors
export type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export const BLOCK_COLORS: BlockColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

// Block interface
export interface Block {
  id: string;
  color: BlockColor;
  eliminatedCount?: number; // Track how many blocks this block has eliminated (for Area B blocks)
}

// Game configuration
const AREA_C_ROWS = 4;
const AREA_C_COLS = 5;
const AREA_B_MAX = 7;
const ELIMINATION_DELAY_MS = 100;
const INITIAL_POWERUPS = 2;
const POWERUP_REMOVE_COUNT = 3;

interface GameState {
  // Area A: blocks to be eliminated (2D grid, column-first storage)
  areaA: (Block | null)[][];
  // Area B: temporary storage (1D array)
  areaB: (Block | null)[];
  // Area C: blocks to use for elimination (2D grid, column-first storage)
  areaC: (Block | null)[][];
  // Game status
  gameStatus: 'playing' | 'won' | 'lost';
  // Power-up count
  powerUpCount: number;
  // Initialize game
  initGame: () => void;
  // Click block in Area C
  clickAreaC: (col: number) => void;
  // Try to eliminate blocks in Area A
  tryEliminate: () => void;
  // Check win/lose conditions
  checkGameStatus: () => void;
  // Activate power-up to remove blocks from Area B
  activatePowerUp: () => void;
}

// Generate unique ID using crypto API for guaranteed uniqueness
let idCounter = 0;
const generateId = () => {
  idCounter++;
  return `${Date.now()}-${idCounter}-${Math.random().toString(36).substring(2, 9)}`;
};

// Create initial blocks for Area C
const createAreaCBlocks = (): (Block | null)[][] => {
  const columns: (Block | null)[][] = [];
  
  // Create blocks for each column
  for (let col = 0; col < AREA_C_COLS; col++) {
    const column: (Block | null)[] = [];
    for (let row = 0; row < AREA_C_ROWS; row++) {
      const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
      column.push({ id: generateId(), color });
    }
    columns.push(column);
  }
  
  return columns;
};

// Create initial blocks for Area A based on Area C (3x the count of each color)
const createAreaABlocks = (areaC: (Block | null)[][]): (Block | null)[][] => {
  // Count colors in Area C
  const colorCounts: Record<BlockColor, number> = { red: 0, blue: 0, green: 0, yellow: 0, purple: 0 };
  for (const column of areaC) {
    for (const block of column) {
      if (block) {
        colorCounts[block.color]++;
      }
    }
  }
  
  // Create 3x the blocks for Area A
  const blocks: Block[] = [];
  for (const color of BLOCK_COLORS) {
    for (let i = 0; i < colorCounts[color] * 3; i++) {
      blocks.push({ id: generateId(), color });
    }
  }
  
  // Shuffle blocks
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  }
  
  // Distribute to columns (5 columns like Area C)
  const columns: (Block | null)[][] = [];
  const AREA_A_COLS = 5;
  const totalRows = Math.ceil(blocks.length / AREA_A_COLS);
  
  for (let col = 0; col < AREA_A_COLS; col++) {
    const column: (Block | null)[] = [];
    for (let row = 0; row < totalRows; row++) {
      const index = row * AREA_A_COLS + col;
      if (index < blocks.length) {
        column.push(blocks[index]);
      }
    }
    columns.push(column);
  }
  
  return columns;
};

export const useGameStore = create<GameState>((set, get) => ({
  areaA: [],
  areaB: [],
  areaC: [],
  gameStatus: 'playing',
  powerUpCount: INITIAL_POWERUPS,

  initGame: () => {
    const areaC = createAreaCBlocks();
    const areaA = createAreaABlocks(areaC);
    const areaB: (Block | null)[] = new Array(AREA_B_MAX).fill(null);
    
    set({ areaA, areaB, areaC, gameStatus: 'playing', powerUpCount: INITIAL_POWERUPS });
  },

  clickAreaC: (col: number) => {
    const { areaC, areaB, gameStatus } = get();
    if (gameStatus !== 'playing') return;
    
    // Get the top block (first row) of the column
    const column = areaC[col];
    if (!column || column.length === 0) return;
    
    const block = column[0];
    if (!block) return;
    
    // Find empty slot in Area B
    const emptyIndex = areaB.findIndex(b => b === null);
    if (emptyIndex === -1) {
      // No empty slot, check for game over
      get().checkGameStatus();
      return;
    }
    
    // Move block from Area C to Area B
    const newAreaC = areaC.map((c, i) => {
      if (i === col) {
        // Remove first element and shift up
        return c.slice(1);
      }
      return c;
    });
    
    const newAreaB = [...areaB];
    newAreaB[emptyIndex] = block;
    
    // Update state
    set({ areaC: newAreaC, areaB: newAreaB });
    
    // Try to eliminate immediately - Zustand's get() returns updated state after set()
    get().tryEliminate();
  },

  tryEliminate: () => {
    const { areaA, areaB, gameStatus } = get();
    if (gameStatus !== 'playing') return;
    
    // Check each block in Area B
    for (let i = 0; i < areaB.length; i++) {
      const bBlock = areaB[i];
      if (!bBlock) continue;
      
      // Find the first matching block in the bottom row of Area A
      for (let col = 0; col < areaA.length; col++) {
        const column = areaA[col];
        if (column.length > 0) {
          const bottomBlock = column[column.length - 1];
          if (bottomBlock && bottomBlock.color === bBlock.color) {
            // Found a matching block - eliminate it
            const newAreaA = areaA.map((c, colIdx) => {
              if (colIdx === col) {
                // Remove the bottom block
                return c.slice(0, -1);
              }
              return c;
            });
            
            // Update the eliminated count for this Area B block
            const currentCount = bBlock.eliminatedCount || 0;
            const newCount = currentCount + 1;
            
            const newAreaB = [...areaB];
            if (newCount >= 3) {
              // Block has eliminated 3 blocks, remove it from Area B
              newAreaB[i] = null;
            } else {
              // Update the eliminated count
              newAreaB[i] = { ...bBlock, eliminatedCount: newCount };
            }
            
            set({ areaA: newAreaA, areaB: newAreaB });
            
            // Continue checking for more eliminations after a delay for animation
            setTimeout(() => {
              get().tryEliminate();
              get().checkGameStatus();
            }, ELIMINATION_DELAY_MS);
            return;
          }
        }
      }
    }
    
    // No more eliminations possible, check game status
    get().checkGameStatus();
  },

  checkGameStatus: () => {
    const { areaA, areaB, areaC, powerUpCount } = get();
    
    // Check win condition: all areas empty
    const areaAEmpty = areaA.every(col => col.length === 0);
    const areaBEmpty = areaB.every(b => b === null);
    const areaCEmpty = areaC.every(col => col.length === 0);
    
    if (areaAEmpty && areaBEmpty && areaCEmpty) {
      set({ gameStatus: 'won' });
      return;
    }
    
    // Check lose condition: Area B is full and no elimination is possible and no power-ups
    const areaBFull = areaB.every(b => b !== null);
    
    if (areaBFull) {
      // Check if any elimination is possible (any matching color in bottom row of Area A)
      let canEliminate = false;
      for (const bBlock of areaB) {
        if (!bBlock) continue;
        for (const column of areaA) {
          if (column.length > 0) {
            const bottomBlock = column[column.length - 1];
            if (bottomBlock && bottomBlock.color === bBlock.color) {
              canEliminate = true;
              break;
            }
          }
        }
        if (canEliminate) break;
      }
      
      // Only lose if can't eliminate AND no power-ups available
      if (!canEliminate && powerUpCount === 0) {
        set({ gameStatus: 'lost' });
      }
    }
  },

  activatePowerUp: () => {
    const { areaA, areaB, powerUpCount, gameStatus } = get();
    if (gameStatus !== 'playing') return;
    if (powerUpCount <= 0) return;
    
    // Get the first 3 blocks from Area B (non-null)
    const blocksToRemove: { index: number; block: Block }[] = [];
    for (let i = 0; i < areaB.length && blocksToRemove.length < POWERUP_REMOVE_COUNT; i++) {
      const block = areaB[i];
      if (block) {
        blocksToRemove.push({ index: i, block });
      }
    }
    
    if (blocksToRemove.length === 0) return;
    
    // Create new Area B with removed blocks
    const newAreaB = [...areaB];
    for (const { index } of blocksToRemove) {
      newAreaB[index] = null;
    }
    
    // Remove corresponding blocks from Area A based on remaining elimination count
    const newAreaA = areaA.map(col => [...col]);
    
    for (const { block } of blocksToRemove) {
      const remaining = 3 - (block.eliminatedCount || 0);
      let toRemove = remaining;
      
      // Remove blocks from bottom of Area A columns that match the color
      for (let col = 0; col < newAreaA.length && toRemove > 0; col++) {
        const column = newAreaA[col];
        // Remove from bottom
        for (let row = column.length - 1; row >= 0 && toRemove > 0; row--) {
          const aBlock = column[row];
          if (aBlock && aBlock.color === block.color) {
            column.splice(row, 1);
            toRemove--;
          }
        }
      }
    }
    
    set({ 
      areaA: newAreaA, 
      areaB: newAreaB, 
      powerUpCount: powerUpCount - 1 
    });
    
    // Check game status after power-up use
    setTimeout(() => {
      get().tryEliminate();
      get().checkGameStatus();
    }, ELIMINATION_DELAY_MS);
  },
}));
