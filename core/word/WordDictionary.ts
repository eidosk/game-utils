// eidosk/core/word/WordDictionary.ts
import { Trie } from 'eidosk/core';

export class WordDictionary {
    private trie: Trie;
    private wordSet: Set<string>;
    private _size: number = 0;


    constructor(words: string[] = []) {
        this.trie = new Trie();
        this.wordSet = new Set();

        if (words.length > 0) {
            this.addWords(words);
        }
    }

    /**
     * Add multiple words to the dictionary
     */
    addWords(words: string[]): void {
        for (const word of words) {
            this.addWord(word);
        }
    }

    /**
     * Get all words as an array
     */
    getAllWords(): string[] {
        return Array.from(this.wordSet).sort();
    }

    /**
     * Add a single word to the dictionary
     */
    addWord(word: string): void {
        const normalized = this.normalizeWord(word);
        if (normalized && !this.wordSet.has(normalized)) {
            this.trie.insert(normalized);
            this.wordSet.add(normalized);
            this._size++;
        }
    }

    /**
     * Check if a word exists in the dictionary
     */
    contains(word: string): boolean {
        const normalized = this.normalizeWord(word);
        return normalized ? this.trie.search(normalized) : false;
    }

    /**
     * Check if a prefix exists in the dictionary
     */
    hasPrefix(prefix: string): boolean {
        const normalized = this.normalizeWord(prefix);
        return normalized ? this.trie.startsWith(normalized) : false;
    }

    /**
     * Get a defensive copy of the word set for external use
     */
    getWordSet(): Set<string> {
        return new Set(this.wordSet);
    }

    /**
     * Get direct access to the Trie (for internal use by validators)
     */
    getTrie(): Trie {
        return this.trie;
    }

    /**
     * Get the number of words in the dictionary
     */
    size(): number {
        return this._size;
    }

    /**
     * Check if dictionary is empty
     */
    isEmpty(): boolean {
        return this._size === 0;
    }

    /**
     * Clear all words from the dictionary
     */
    clear(): void {
        this.trie = new Trie();
        this.wordSet.clear();
        this._size = 0;
    }

    /**
     * Get all words that start with a given prefix
     */
    getWordsWithPrefix(prefix: string, maxResults: number = 50): string[] {
        const normalized = this.normalizeWord(prefix);
        if (!normalized) return [];

        const results: string[] = [];

        // Simple implementation - could be optimized with Trie traversal
        for (const word of this.wordSet) {
            if (word.startsWith(normalized)) {
                results.push(word);
                if (results.length >= maxResults) break;
            }
        }

        return results.sort();
    }

    /**
     * Get words by length range
     */
    getWordsByLength(minLength: number, maxLength: number): string[] {
        const results: string[] = [];

        for (const word of this.wordSet) {
            if (word.length >= minLength && word.length <= maxLength) {
                results.push(word);
            }
        }

        return results.sort();
    }

    /**
     * Get dictionary statistics
     */
    getStats(): {
        totalWords: number;
        averageLength: number;
        lengthDistribution: { [length: number]: number };
        shortestWord: string | null;
        longestWord: string | null;
    } {
        if (this._size === 0) {
            return {
                totalWords: 0,
                averageLength: 0,
                lengthDistribution: {},
                shortestWord: null,
                longestWord: null
            };
        }

        let totalLength = 0;
        let shortestWord: string | null = null;
        let longestWord: string | null = null;
        const lengthDistribution: { [length: number]: number } = {};

        for (const word of this.wordSet) {
            totalLength += word.length;

            // Track length distribution
            lengthDistribution[word.length] = (lengthDistribution[word.length] || 0) + 1;

            // Track shortest/longest
            if (!shortestWord || word.length < shortestWord.length) {
                shortestWord = word;
            }
            if (!longestWord || word.length > longestWord.length) {
                longestWord = word;
            }
        }

        return {
            totalWords: this._size,
            averageLength: totalLength / this._size,
            lengthDistribution,
            shortestWord,
            longestWord
        };
    }

    /**
     * Normalize word for consistent storage and lookup
     */
    private normalizeWord(word: string): string | null {
        if (!word || typeof word !== 'string') return null;

        const normalized = word.trim().toUpperCase();

        // Only allow alphabetic characters
        if (!/^[A-Z]+$/.test(normalized)) return null;

        return normalized;
    }

    /**
     * Export dictionary as array (for serialization)
     */
    toArray(): string[] {
        return Array.from(this.wordSet).sort();
    }

    /**
     * Create a Dictionary from common English words
     */
    static createBasicEnglish(): WordDictionary {
        const basicWords = [
            // 3-letter words
            "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL", "CAN", "HER", "WAS", "ONE", "OUR",
            "HAD", "BUT", "NOT", "YOU", "ALL", "CAN", "HER", "WAS", "ONE", "OUR", "OUT", "DAY", "GET",
            "USE", "MAN", "NEW", "NOW", "OLD", "SEE", "HIM", "TWO", "HOW", "ITS", "WHO", "OIL", "SIT",
            "SET", "RUN", "EAT", "FAR", "SEA", "EYE", "BAD", "BIG", "BOX", "YES", "YET", "CAR", "JOB",

            // 4-letter words
            "THAT", "WITH", "HAVE", "THIS", "WILL", "YOUR", "FROM", "THEY", "KNOW", "WANT", "BEEN",
            "GOOD", "MUCH", "SOME", "TIME", "VERY", "WHEN", "COME", "HERE", "JUST", "LIKE", "LONG",
            "MAKE", "MANY", "OVER", "SUCH", "TAKE", "THAN", "THEM", "WELL", "WERE", "WORK", "YEAR",
            "BACK", "CALL", "CAME", "EACH", "EVEN", "FIND", "GIVE", "HAND", "HIGH", "KEEP", "LAST",
            "LEFT", "LIFE", "LIVE", "LOOK", "MADE", "MOST", "MOVE", "MUST", "NAME", "NEED", "NEXT",
            "OPEN", "PART", "PLAY", "RIGHT", "SAID", "SAME", "SEEM", "SHOW", "SIDE", "TELL", "TURN",
            "USED", "WANT", "WAYS", "WEEK", "WENT", "WHAT", "WORD", "WORK", "YEAR", "YOUR",

            // 5-letter words
            "ABOUT", "AFTER", "AGAIN", "ASKED", "BEING", "BELOW", "COULD", "EVERY", "FIRST", "FOUND",
            "GREAT", "GROUP", "HOUSE", "LARGE", "PLACE", "RIGHT", "SHALL", "SMALL", "STATE", "STILL",
            "THOSE", "THREE", "UNDER", "WATER", "WHERE", "WHILE", "WORLD", "WOULD", "YOUNG"
        ];

        return new WordDictionary(basicWords);
    }

    /**
     * Load dictionary from array (for deserialization)
     */
    static fromArray(words: string[]): WordDictionary {
        const dictionary = new WordDictionary();
        dictionary.addWords(words);
        return dictionary;
    }
}