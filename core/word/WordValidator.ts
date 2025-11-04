// eidosk/core/word/WordValidator.ts
import { Trie, ScrabbleScorer, GridPositionUtils, GridPosition } from 'eidosk/core';

export interface ValidationResult {
    isValid: boolean;
    word: string;
    score: number;
    reason?: string;
}

export interface ValidationOptions {
    strictPathValidation?: boolean;
}

export class WordValidator {
    constructor(
        private dictionary: Trie,
        private wordScorer: ScrabbleScorer,
        private minLength: number = 3,
        private maxLength: number = 8,
        private commonWords?: Set<string>
    ) {
        if (minLength < 1 || maxLength < minLength) {
            throw new Error("Invalid word length configuration");
        }
    }

    validateWordPath(
        grid: (string | null | undefined)[][],
        path: GridPosition[],
        options: ValidationOptions = {}
    ): ValidationResult {
        const pathValidation = this.validatePath(path, grid.length, grid[0]?.length || 0);
        if (!pathValidation.isValid) {
            return pathValidation;
        }

        const word = GridPositionUtils.buildWordFromPath(grid, path);
        if (!word) {
            return {
                isValid: false,
                word: "",
                score: 0,
                reason: "Could not build word from path"
            };
        }

        return this.validateWord(word, options);
    }

    validateWordPathWithWildcards(
        grid: (string | null | undefined)[][],
        path: GridPosition[],
        wildcardPositions: number[],
        options: ValidationOptions = {}
    ): ValidationResult {
        const pathValidation = this.validatePath(path, grid.length, grid[0]?.length || 0);
        if (!pathValidation.isValid) {
            return pathValidation;
        }

        let wordPattern = "";
        for (let i = 0; i < path.length; i++) {
            if (wildcardPositions.includes(i)) {
                wordPattern += '?';
            } else {
                const pos = path[i];
                const letter = grid[pos.row]?.[pos.col];
                wordPattern += letter ? letter.toUpperCase() : '';
            }
        }

        const validWords = this.findValidWordsForPattern(wordPattern);

        if (validWords.length === 0) {
            return {
                isValid: false,
                word: wordPattern,
                score: 0,
                reason: "No valid words found for pattern"
            };
        }

        const bestWord = this.selectBestWord(validWords);
        const score = this.wordScorer.calculateScore(bestWord);

        return {
            isValid: true,
            word: bestWord,
            score: score
        };
    }

    private findValidWordsForPattern(pattern: string): string[] {
        const wildcardCount = (pattern.match(/\?/g) || []).length;

        if (wildcardCount === 0) {
            return this.dictionary.search(pattern) ? [pattern] : [];
        }

        if (wildcardCount > 2) {
            console.warn("Too many wildcards (max 2)");
            return [];
        }

        const validWords: string[] = [];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.generateWildcardCombinations(pattern, letters, validWords);

        return validWords;
    }

    private generateWildcardCombinations(
        pattern: string,
        letters: string,
        validWords: string[]
    ): void {
        const wildcardIndex = pattern.indexOf('?');

        if (wildcardIndex === -1) {
            if (this.dictionary.search(pattern)) {
                validWords.push(pattern);
            }
            return;
        }

        for (const letter of letters) {
            const newPattern = pattern.substring(0, wildcardIndex) +
                letter +
                pattern.substring(wildcardIndex + 1);
            this.generateWildcardCombinations(newPattern, letters, validWords);
        }
    }

    private selectBestWord(words: string[]): string {
        if (words.length === 0) return "";
        if (words.length === 1) return words[0];

        if (this.commonWords) {
            const commonWord = words.find(word =>
                this.commonWords!.has(word.toUpperCase())
            );
            if (commonWord) {
                console.log("Found common word:", commonWord);
                return commonWord;
            }
        }

        const shortest = words.reduce((a, b) => a.length <= b.length ? a : b);
        console.log("Using shortest word:", shortest);
        return shortest;
    }

    validateWord(word: string, options: ValidationOptions = {}): ValidationResult {
        const normalizedWord = word.toUpperCase().trim();

        if (normalizedWord.length < this.minLength) {
            return {
                isValid: false,
                word: normalizedWord,
                score: 0,
                reason: "Word too short (minimum " + this.minLength + " letters)"
            };
        }

        if (normalizedWord.length > this.maxLength) {
            return {
                isValid: false,
                word: normalizedWord,
                score: 0,
                reason: "Word too long (maximum " + this.maxLength + " letters)"
            };
        }

        if (!this.dictionary.search(normalizedWord)) {
            return {
                isValid: false,
                word: normalizedWord,
                score: 0,
                reason: "Not a valid word"
            };
        }

        const score = this.wordScorer.calculateScore(normalizedWord);

        return {
            isValid: true,
            word: normalizedWord,
            score: score
        };
    }

    validatePath(path: GridPosition[], rows: number, cols: number): ValidationResult {
        if (!path || path.length === 0) {
            return {
                isValid: false,
                word: "",
                score: 0,
                reason: "Empty path"
            };
        }

        for (const pos of path) {
            if (!GridPositionUtils.isValidPosition(pos, rows, cols)) {
                return {
                    isValid: false,
                    word: "",
                    score: 0,
                    reason: "Position out of bounds: (" + pos.row + "," + pos.col + ")"
                };
            }
        }

        if (!GridPositionUtils.isValidPath(path)) {
            return {
                isValid: false,
                word: "",
                score: 0,
                reason: "Invalid path - positions must be connected"
            };
        }

        return {
            isValid: true,
            word: "",
            score: 0
        };
    }

    validateWords(words: string[], options: ValidationOptions = {}): {
        results: ValidationResult[];
        validWords: string[];
        invalidWords: string[];
        totalScore: number;
    } {
        const results: ValidationResult[] = [];
        const validWords: string[] = [];
        const invalidWords: string[] = [];
        let totalScore = 0;

        for (const word of words) {
            const result = this.validateWord(word, options);
            results.push(result);

            if (result.isValid) {
                validWords.push(result.word);
                totalScore += result.score;
            } else {
                invalidWords.push(word);
            }
        }

        return {
            results,
            validWords,
            invalidWords,
            totalScore
        };
    }

    hasValidPrefix(prefix: string): boolean {
        if (prefix.length === 0) return true;
        return this.dictionary.startsWith(prefix.toUpperCase());
    }

    getScorer(): ScrabbleScorer {
        return this.wordScorer;
    }

    setScorer(scorer: ScrabbleScorer): void {
        this.wordScorer = scorer;
    }

    getConfig(): {
        minLength: number;
        maxLength: number;
    } {
        return {
            minLength: this.minLength,
            maxLength: this.maxLength
        };
    }

    validatePartialPath(
        grid: (string | null | undefined)[][],
        path: GridPosition[]
    ): {
        isValidPath: boolean;
        currentWord: string;
        hasValidPrefix: boolean;
        couldBeValid: boolean;
        reason?: string;
    } {
        if (path.length === 0) {
            return {
                isValidPath: false,
                currentWord: "",
                hasValidPrefix: true,
                couldBeValid: true,
                reason: "Empty path"
            };
        }

        const pathResult = this.validatePath(path, grid.length, grid[0]?.length || 0);
        if (!pathResult.isValid) {
            return {
                isValidPath: false,
                currentWord: "",
                hasValidPrefix: false,
                couldBeValid: false,
                reason: pathResult.reason
            };
        }

        const currentWord = GridPositionUtils.buildWordFromPath(grid, path);
        const hasPrefix = this.hasValidPrefix(currentWord);

        return {
            isValidPath: true,
            currentWord,
            hasValidPrefix: hasPrefix,
            couldBeValid: hasPrefix && path.length <= this.maxLength,
            reason: hasPrefix ? undefined : "No words start with '" + currentWord + "'"
        };
    }

    getStats(): {
        minLength: number;
        maxLength: number;
        dictionarySize: number;
    } {
        return {
            minLength: this.minLength,
            maxLength: this.maxLength,
            dictionarySize: -1
        };
    }
}