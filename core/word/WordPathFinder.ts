// eidosk/core/word/WordPathFinder.ts
import { GridPositionUtils, GridPosition, ScrabbleScorer } from 'eidosk/core';

export interface PathFinderOptions {
    maxResults?: number;
    minScore?: number;
    excludeWords?: Set<string>;
    includePartialMatches?: boolean;
}

export interface WordPath {
    positions: GridPosition[];
    word: string;
    score: number;
}

export class WordPathFinder {
    constructor(
        private minLength: number = 3,
        private maxLength: number = 8
    ) {
        if (minLength < 1 || maxLength < minLength) {
            throw new Error("Invalid word length configuration");
        }
    }

    /**
     * Find all valid words starting from a specific position
     */
    findWordsFromPosition(
        grid: (string | null | undefined)[][],
        startPos: GridPosition,
        dictionary: Set<string>,
        scorer: ScrabbleScorer,
        options: PathFinderOptions = {}
    ): WordPath[] {
        const {
            maxResults = 10,
            minScore = 0,
            excludeWords = new Set(),
            includePartialMatches = false
        } = options;

        const rows = grid.length;
        const cols = grid[0]?.length || 0;
        const paths: WordPath[] = [];

        if (!GridPositionUtils.isValidPosition(startPos, rows, cols) || !grid[startPos.row][startPos.col]) {
            return [];
        }

        this.exploreFromPosition(
            grid,
            [startPos],
            new Set([GridPositionUtils.positionKey(startPos)]),
            dictionary,
            scorer,
            paths,
            minScore,
            excludeWords,
            includePartialMatches
        );

        // Sort by score (descending) and return top results
        return paths
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }

    /**
     * Find all possible words in the entire grid
     */
    findAllPossibleWords(
        grid: (string | null | undefined)[][],
        dictionary: Set<string>,
        scorer: ScrabbleScorer,
        options: PathFinderOptions = {}
    ): WordPath[] {
        const allWords: WordPath[] = [];
        const rows = grid.length;
        const cols = grid[0]?.length || 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const wordsFromPos = this.findWordsFromPosition(
                    grid,
                    { row, col },
                    dictionary,
                    scorer,
                    { ...options, maxResults: 5 } // Limit per position to avoid explosion
                );
                allWords.push(...wordsFromPos);
            }
        }

        // Remove duplicates (keep highest scoring version)
        const uniqueWords = new Map<string, WordPath>();
        for (const wordPath of allWords) {
            const existing = uniqueWords.get(wordPath.word);
            if (!existing || existing.score < wordPath.score) {
                uniqueWords.set(wordPath.word, wordPath);
            }
        }

        return Array.from(uniqueWords.values())
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Find the best paths of a specific length
     */
    findPathsByLength(
        grid: (string | null | undefined)[][],
        targetLength: number,
        dictionary: Set<string>,
        scorer: ScrabbleScorer,
        maxResults: number = 20
    ): WordPath[] {
        if (targetLength < this.minLength || targetLength > this.maxLength) {
            return [];
        }

        const allPaths = this.findAllPossibleWords(grid, dictionary, scorer, {
            maxResults: maxResults * 2 // Get more to filter from
        });

        return allPaths
            .filter(path => path.word.length === targetLength)
            .slice(0, maxResults);
    }

    /**
     * Find words that use rare letters
     */
    findRareLetterWords(
        grid: (string | null | undefined)[][],
        dictionary: Set<string>,
        scorer: ScrabbleScorer,
        rareLetters: string[] = ['Q', 'X', 'Z', 'J'],
        maxResults: number = 10
    ): WordPath[] {
        const rareLetterSet = new Set(rareLetters.map(l => l.toUpperCase()));

        const allPaths = this.findAllPossibleWords(grid, dictionary, scorer);

        return allPaths
            .filter(path => {
                // Check if word contains any rare letters
                return path.word.split('').some(letter => rareLetterSet.has(letter));
            })
            .slice(0, maxResults);
    }

    /**
     * Find the longest possible words
     */
    findLongestWords(
        grid: (string | null | undefined)[][],
        dictionary: Set<string>,
        scorer: ScrabbleScorer,
        maxResults: number = 5
    ): WordPath[] {
        const allPaths = this.findAllPossibleWords(grid, dictionary, scorer);

        if (allPaths.length === 0) return [];

        // Find the maximum length
        const maxLen = Math.max(...allPaths.map(p => p.word.length));

        // Return all words of maximum length
        return allPaths
            .filter(path => path.word.length === maxLen)
            .slice(0, maxResults);
    }

    /**
     * Check if any valid words exist from a position (quick check)
     */
    hasValidWordsFromPosition(
        grid: (string | null | undefined)[][],
        startPos: GridPosition,
        dictionary: Set<string>
    ): boolean {
        const results = this.findWordsFromPosition(
            grid,
            startPos,
            dictionary,
            new ScrabbleScorer(), // Dummy scorer for quick check
            { maxResults: 1 }
        );
        return results.length > 0;
    }

    /**
     * Private method to recursively explore paths from a position
     */
    private exploreFromPosition(
        grid: (string | null | undefined)[][],
        currentPath: GridPosition[],
        visited: Set<string>,
        dictionary: Set<string>,
        scorer: ScrabbleScorer,
        results: WordPath[],
        minScore: number,
        excludeWords: Set<string>,
        includePartialMatches: boolean
    ): void {
        if (currentPath.length >= this.maxLength) {
            return;
        }

        const lastPos = currentPath[currentPath.length - 1];
        const rows = grid.length;
        const cols = grid[0]?.length || 0;

        const adjacentPositions = GridPositionUtils.getAdjacentPositions(lastPos, rows, cols);

        for (const nextPos of adjacentPositions) {
            const posKey = GridPositionUtils.positionKey(nextPos);

            if (!visited.has(posKey) && grid[nextPos.row][nextPos.col]) {
                const newPath = [...currentPath, nextPos];
                const newVisited = new Set([...visited, posKey]);

                // Check if path is long enough to form a word
                if (newPath.length >= this.minLength) {
                    const word = GridPositionUtils.buildWordFromPath(grid, newPath);

                    if (word.length >= this.minLength &&
                        dictionary.has(word) &&
                        !excludeWords.has(word)) {

                        const scoreBreakdown = scorer.calculateScore(word);

                        if (scoreBreakdown >= minScore) {
                            results.push({
                                positions: [...newPath],
                                word: word,
                                score: scoreBreakdown
                            });
                        }
                    }
                }

                // Continue exploring if we haven't reached max length
                if (newPath.length < this.maxLength) {
                    this.exploreFromPosition(
                        grid,
                        newPath,
                        newVisited,
                        dictionary,
                        scorer,
                        results,
                        minScore,
                        excludeWords,
                        includePartialMatches
                    );
                }
            }
        }
    }
    

    /**
     * Find words that form intersections (share positions)
     */
    findIntersectingWords(
        grid: (string | null | undefined)[][],
        dictionary: Set<string>,
        scorer: ScrabbleScorer,
        maxResults: number = 10
    ): Array<{
        word1: WordPath;
        word2: WordPath;
        intersections: GridPosition[];
    }> {
        const allWords = this.findAllPossibleWords(grid, dictionary, scorer);
        const intersections: Array<{
            word1: WordPath;
            word2: WordPath;
            intersections: GridPosition[];
        }> = [];

        for (let i = 0; i < allWords.length; i++) {
            for (let j = i + 1; j < allWords.length; j++) {
                const word1 = allWords[i];
                const word2 = allWords[j];

                const sharedPositions = this.findSharedPositions(word1.positions, word2.positions);

                if (sharedPositions.length > 0) {
                    intersections.push({
                        word1,
                        word2,
                        intersections: sharedPositions
                    });
                }
            }
        }

        return intersections
            .sort((a, b) => (b.word1.score + b.word2.score) - (a.word1.score + a.word2.score))
            .slice(0, maxResults);
    }

    /**
     * Find positions shared between two word paths
     */
    private findSharedPositions(positions1: GridPosition[], positions2: GridPosition[]): GridPosition[] {
        const shared: GridPosition[] = [];
        const pos1Set = new Set(positions1.map(p => GridPositionUtils.positionKey(p)));

        for (const pos of positions2) {
            if (pos1Set.has(GridPositionUtils.positionKey(pos))) {
                shared.push(pos);
            }
        }

        return shared;
    }

    /**
     * Get path finder statistics
     */
    getStats(): {
        minLength: number;
        maxLength: number;
        searchSpace: string;
    } {
        return {
            minLength: this.minLength,
            maxLength: this.maxLength,
            searchSpace: "8-directional adjacency"
        };
    }

    /**
     * Update length constraints
     */
    setLengthConstraints(minLength: number, maxLength: number): void {
        if (minLength < 1 || maxLength < minLength) {
            throw new Error("Invalid word length configuration");
        }
        (this as any).minLength = minLength;
        (this as any).maxLength = maxLength;
    }
}