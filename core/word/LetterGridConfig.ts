import { Trie, LetterGridOptions, ScrabbleScorer, LetterGenerator, WordPathFinder, WordValidator } from 'eidosk/core';

const DEFAULT_ENGLISH_FREQUENCY = {
    'E': 12.7, 'T': 9.1, 'A': 8.2, 'O': 7.5, 'I': 7.0, 'N': 6.7, 'S': 6.3,
    'H': 6.1, 'R': 6.0, 'D': 4.3, 'L': 4.0, 'C': 2.8, 'U': 2.8, 'M': 2.4,
    'W': 2.4, 'F': 2.2, 'G': 2.0, 'Y': 2.0, 'P': 1.9, 'B': 1.3, 'V': 1.0,
    'K': 0.8, 'J': 0.15, 'X': 0.15, 'Q': 0.10, 'Z': 0.07
};

export class LetterGridConfig {
    readonly minWordLength: number;
    readonly maxWordLength: number;
    readonly letterFrequency: { [key: string]: number };

    constructor(options: LetterGridOptions = {}) {
        this.minWordLength = options.minWordLength || 3;
        this.maxWordLength = options.maxWordLength || 8;
        this.letterFrequency = options.letterFrequency || DEFAULT_ENGLISH_FREQUENCY;

        if (this.minWordLength < 1 || this.minWordLength > this.maxWordLength) {
            throw new Error("Invalid word length configuration");
        }
    }

    createValidator(dictionary: Trie, commonWords?: Set<string>): WordValidator {
        const scorer = new ScrabbleScorer();
        return new WordValidator(
            dictionary,
            scorer,
            this.minWordLength,
            this.maxWordLength,
            commonWords  // ✅ ADD
        );
    }

    createPathFinder(): WordPathFinder {
        return new WordPathFinder(this.minWordLength, this.maxWordLength);
    }

    createLetterGenerator(): LetterGenerator {
        return new LetterGenerator(this.letterFrequency);
    }

    createScrabbleScorer(): ScrabbleScorer {
        return new ScrabbleScorer();
    }

    getSummary() {
        return {
            minWordLength: this.minWordLength,
            maxWordLength: this.maxWordLength,
            letterCount: Object.keys(this.letterFrequency).length
        };
    }
}
