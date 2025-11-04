//todo figure out if we want to keep all types in here

export type CellDataType = string | number | null | undefined;

export interface LayoutConfig {
    // Position & sizing (default/landscape values)
    x?: number;
    y?: number;
    percX?: number;
    percY?: number;
    scale?: number;
    originX?: number;
    originY?: number;

    // Portrait overrides only
    portrait?: Partial<LayoutConfig>;

    // Visual layout properties
    alpha?: number;
    rotation?: number;
    visible?: boolean;

    // Localization
    loc?: boolean;
}

export interface LetterGridOptions {
    minWordLength?: number;
    maxWordLength?: number;
    commonWords?: Set<string>;  // ✅ ADD
    difficulty?: 'easy' | 'medium' | 'hard';
    letterFrequency?: { [key: string]: number };
    cacheOptions?: {
        strategy?: 'memory' | 'lru';
        maxSize?: number;
        ttlMs?: number;
    };
}

export interface GridStats {
    totalLetters: number;
    emptyTiles: number;
    letterCounts: { [key: string]: number };
    possibleWords?: number;
}


