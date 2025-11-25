import { create } from 'zustand';

// Block colors
export type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export const BLOCK_COLORS: BlockColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

// Block interface
export interface Block {
  id: string;
  color: BlockColor;
}

// Game configuration
const AREA_C_ROWS = 4;
const AREA_C_COLS = 5;
const AREA_B_MAX = 7;

interface GameState {
  // Area A: blocks to be eliminated (2D grid, column-first storage)
  areaA: (Block | null)[][];
  // Area B: temporary storage (1D array)
  areaB: (Block | null)[];
  // Area C: blocks to use for elimination (2D grid, column-first storage)
  areaC: (Block | null)[][];
  // Game status
  gameStatus: 'playing' | 'won' | 'lost';
  // Initialize game
  initGame: () => void;
  // Click block in Area C
  clickAreaC: (col: number) => void;
  // Try to eliminate blocks in Area A
  tryEliminate: () => void;
  // Check win/lose conditions
  checkGameStatus: () => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

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

  initGame: () => {
    const areaC = createAreaCBlocks();
    const areaA = createAreaABlocks(areaC);
    const areaB: (Block | null)[] = new Array(AREA_B_MAX).fill(null);
    
    set({ areaA, areaB, areaC, gameStatus: 'playing' });
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
    
    set({ areaC: newAreaC, areaB: newAreaB });
    
    // Try to eliminate
    get().tryEliminate();
  },

  tryEliminate: () => {
    const { areaA, areaB, gameStatus } = get();
    if (gameStatus !== 'playing') return;
    
    // Check each block in Area B
    for (let i = 0; i < areaB.length; i++) {
      const bBlock = areaB[i];
      if (!bBlock) continue;
      
      // Count matching blocks in the bottom row of Area A
      const matchingPositions: { col: number }[] = [];
      for (let col = 0; col < areaA.length; col++) {
        const column = areaA[col];
        if (column.length > 0) {
          const bottomBlock = column[column.length - 1];
          if (bottomBlock && bottomBlock.color === bBlock.color) {
            matchingPositions.push({ col });
          }
        }
      }
      
      // If we have 3 or more matching blocks, eliminate them
      if (matchingPositions.length >= 3) {
        // Take first 3 matches
        const toEliminate = matchingPositions.slice(0, 3);
        
        // Remove blocks from Area A
        const newAreaA = areaA.map((column, col) => {
          const shouldRemove = toEliminate.some(pos => pos.col === col);
          if (shouldRemove) {
            // Remove the bottom block
            return column.slice(0, -1);
          }
          return column;
        });
        
        // Remove the block from Area B
        const newAreaB = [...areaB];
        newAreaB[i] = null;
        
        set({ areaA: newAreaA, areaB: newAreaB });
        
        // Continue checking for more eliminations
        setTimeout(() => {
          get().tryEliminate();
          get().checkGameStatus();
        }, 100);
        return;
      }
    }
    
    // No more eliminations possible, check game status
    get().checkGameStatus();
  },

  checkGameStatus: () => {
    const { areaA, areaB, areaC } = get();
    
    // Check win condition: all areas empty
    const areaAEmpty = areaA.every(col => col.length === 0);
    const areaBEmpty = areaB.every(b => b === null);
    const areaCEmpty = areaC.every(col => col.length === 0);
    
    if (areaAEmpty && areaBEmpty && areaCEmpty) {
      set({ gameStatus: 'won' });
      return;
    }
    
    // Check lose condition: Area B is full and no elimination is possible
    const areaBFull = areaB.every(b => b !== null);
    
    if (areaBFull) {
      // Check if any elimination is possible
      let canEliminate = false;
      for (const bBlock of areaB) {
        if (!bBlock) continue;
        let count = 0;
        for (const column of areaA) {
          if (column.length > 0) {
            const bottomBlock = column[column.length - 1];
            if (bottomBlock && bottomBlock.color === bBlock.color) {
              count++;
            }
          }
        }
        if (count >= 3) {
          canEliminate = true;
          break;
        }
      }
      
      if (!canEliminate) {
        set({ gameStatus: 'lost' });
      }
    }
  },
}));
