// eidosk/core/grid/cache/CacheStrategy.ts
import { CacheOptions } from './GridCache';

export abstract class CacheStrategy<T> {
    protected readonly maxSize: number;
    protected readonly ttlMs: number;

    constructor(options: CacheOptions) {
        this.maxSize = options.maxSize || 100;
        this.ttlMs = options.ttlMs || 300000;
    }

    abstract get(key: string): T | undefined;
    abstract set(key: string, value: T): void;
    abstract clear(): void;
    abstract size(): number;

    static create<T>(options: CacheOptions): CacheStrategy<T> {
        switch (options.strategy) {
            case 'lru':
                return new LRUCacheStrategy<T>(options);
            case 'memory':
            default:
                return new MemoryCacheStrategy<T>(options);
        }
    }
}

/**
 * Simple in-memory cache strategy
 */
export class MemoryCacheStrategy<T> extends CacheStrategy<T> {
    private cache: Map<string, { value: T; timestamp: number }> = new Map();

    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        // Check TTL
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.value;
    }

    set(key: string, value: T): void {
        // Remove oldest entry if at max size
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (typeof firstKey === "string") {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}

/**
 * Proper LRU cache using Map's insertion order
 */
export class LRUCacheStrategy<T> extends CacheStrategy<T> {
    private cache: Map<string, { value: T; timestamp: number }> = new Map();

    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        // Check TTL
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return undefined;
        }

        // Move to end (most recently used) - O(1) operation
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    set(key: string, value: T): void {
        // If key exists, delete first to update position
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }

        // Remove LRU (first) entry if at max size
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (typeof firstKey === "string") {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}