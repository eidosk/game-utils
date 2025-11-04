import { GridPosition, WordPath } from 'eidosk/core';
import { CacheStrategy } from './CacheStrategy';

export interface CacheOptions {
    strategy?: 'memory' | 'lru';
    maxSize?: number;
    ttlMs?: number;
}

export class GridCache<T> {
    private gridStateHash: string = '';
    private allWordsCache: WordPath[] | null = null;
    private positionCache: Map<string, WordPath[]> = new Map();
    private strategy: CacheStrategy<WordPath[]>;
    private readonly options: CacheOptions;

    constructor(options: CacheOptions = {}) {
        this.options = {
            strategy: 'memory',
            maxSize: 100,
            ttlMs: 300000, // 5 minutes
            ...options
        };

        this.strategy = CacheStrategy.create(this.options);
    }

    /**
     * Generate hash of grid state for cache invalidation
     */
    generateGridHash(grid: (T | null | undefined)[][]): string {
        const flatData: string[] = [];
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const cell = grid[row][col];
                flatData.push(cell ? String(cell) : '_');
            }
        }
        return flatData.join('');
    }

    /**
     * Check if current cache is valid for given grid state
     */
    isCacheValid(currentGrid: (T | null | undefined)[][]): boolean {
        const currentHash = this.generateGridHash(currentGrid);
        return this.gridStateHash === currentHash && this.gridStateHash !== '';
    }

    /**
     * Invalidate all caches and update grid state
     */
    invalidate(currentGrid: (T | null | undefined)[][]): void {
        this.allWordsCache = null;
        this.positionCache.clear();
        this.strategy.clear();
        this.gridStateHash = this.generateGridHash(currentGrid);
    }

    /**
     * Get cached words for a specific position
     */
    getPositionWords(pos: GridPosition): WordPath[] | undefined {
        const key = this.getPositionKey(pos);

        // Check simple map first
        if (this.positionCache.has(key)) {
            return this.positionCache.get(key);
        }

        // Check strategy cache
        return this.strategy.get(key);
    }

    /**
     * Cache words for a specific position
     */
    setPositionWords(pos: GridPosition, words: WordPath[]): void {
        const key = this.getPositionKey(pos);

        // Store in simple map for frequent access
        this.positionCache.set(key, words);

        // Also store in strategy cache
        this.strategy.set(key, words);
    }

    /**
     * Get cached result for all possible words
     */
    getAllWords(): WordPath[] | null {
        return this.allWordsCache;
    }

    /**
     * Cache result for all possible words
     */
    setAllWords(words: WordPath[]): void {
        this.allWordsCache = words;
    }

    /**
     * Generate cache key for a position
     */
    getPositionKey(pos: GridPosition): string {
        return pos.row + "," + pos.col;
    }

    /**
     * Clear all caches
     */
    clear(): void {
        this.allWordsCache = null;
        this.positionCache.clear();
        this.strategy.clear();
        this.gridStateHash = '';
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        gridHash: string;
        positionCacheSize: number;
        hasAllWordsCache: boolean;
        strategyCacheSize: number;
    } {
        return {
            gridHash: this.gridStateHash,
            positionCacheSize: this.positionCache.size,
            hasAllWordsCache: this.allWordsCache !== null,
            strategyCacheSize: this.strategy.size()
        };
    }

    /**
     * Manually set grid hash (for testing)
     */
    setGridHash(hash: string): void {
        this.gridStateHash = hash;
    }
}