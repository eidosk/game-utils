// eidosk/core/word/LetterGenerator.ts

export class LetterGenerator {
    private readonly letters: string[];
    private readonly cumulativeWeights: number[];
    private readonly totalWeight: number;

    constructor(letterFrequency: { [key: string]: number }) {
        this.letters = Object.keys(letterFrequency);
        this.cumulativeWeights = [];

        if (this.letters.length === 0) {
            throw new Error("Letter frequency map cannot be empty");
        }

        // Pre-calculate cumulative weights for efficient picking
        let sum = 0;
        for (const letter of this.letters) {
            const weight = letterFrequency[letter];
            if (weight <= 0) {
                throw new Error("Letter frequency must be positive: " + letter);
            }
            sum += weight;
            this.cumulativeWeights.push(sum);
        }

        this.totalWeight = sum;
    }

    /**
     * Generate a single random letter based on frequency distribution
     */
    generateLetter(): string {
        const random = Math.random() * this.totalWeight;

        for (let i = 0; i < this.cumulativeWeights.length; i++) {
            if (random <= this.cumulativeWeights[i]) {
                return this.letters[i];
            }
        }

        // Fallback (should never reach here with valid input)
        return this.letters[Math.floor(Math.random() * this.letters.length)];
    }

    /**
     * Generate multiple letters efficiently
     */
    generateLetters(count: number): string[] {
        if (count <= 0) return [];

        const letters: string[] = [];
        for (let i = 0; i < count; i++) {
            letters.push(this.generateLetter());
        }
        return letters;
    }

    /**
     * Generate letters ensuring no duplicates in the result
     */
    generateUniqueLetters(count: number): string[] {
        if (count <= 0) return [];
        if (count > this.letters.length) {
            throw new Error("Cannot generate more unique letters than available: " + count + " > " + this.letters.length);
        }

        const result: string[] = [];
        const used = new Set<string>();

        while (result.length < count) {
            const letter = this.generateLetter();
            if (!used.has(letter)) {
                used.add(letter);
                result.push(letter);
            }
        }

        return result;
    }

    /**
     * Generate a letter that's different from the excluded ones
     */
    generateLetterExcluding(excludedLetters: string[]): string {
        const excluded = new Set(excludedLetters);

        // If all letters are excluded, return any letter
        if (excluded.size >= this.letters.length) {
            return this.generateLetter();
        }

        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loop

        while (attempts < maxAttempts) {
            const letter = this.generateLetter();
            if (!excluded.has(letter)) {
                return letter;
            }
            attempts++;
        }

        // Fallback: return any non-excluded letter
        for (const letter of this.letters) {
            if (!excluded.has(letter)) {
                return letter;
            }
        }

        return this.generateLetter();
    }

    /**
     * Get the probability of generating a specific letter
     */
    getLetterProbability(letter: string): number {
        const index = this.letters.indexOf(letter);
        if (index === -1) return 0;

        const previousWeight = index > 0 ? this.cumulativeWeights[index - 1] : 0;
        const currentWeight = this.cumulativeWeights[index];
        return (currentWeight - previousWeight) / this.totalWeight;
    }

    /**
     * Get all available letters
     */
    getAvailableLetters(): string[] {
        return [...this.letters];
    }

    /**
     * Get letters sorted by frequency (most common first)
     */
    getLettersByFrequency(): Array<{ letter: string; probability: number }> {
        return this.letters.map(letter => ({
            letter,
            probability: this.getLetterProbability(letter)
        })).sort((a, b) => b.probability - a.probability);
    }

    /**
     * Generate a weighted random sample of letters
     */
    generateWeightedSample(sampleSize: number, allowDuplicates: boolean = true): string[] {
        if (sampleSize <= 0) return [];

        if (allowDuplicates) {
            return this.generateLetters(sampleSize);
        } else {
            return this.generateUniqueLetters(sampleSize);
        }
    }

    /**
     * Get generator statistics
     */
    getStats(): {
        totalLetters: number;
        totalWeight: number;
        mostCommon: string;
        leastCommon: string;
        averageWeight: number;
    } {
        let mostCommon = this.letters[0];
        let leastCommon = this.letters[0];
        let maxProb = this.getLetterProbability(mostCommon);
        let minProb = maxProb;

        for (const letter of this.letters) {
            const prob = this.getLetterProbability(letter);
            if (prob > maxProb) {
                maxProb = prob;
                mostCommon = letter;
            }
            if (prob < minProb) {
                minProb = prob;
                leastCommon = letter;
            }
        }

        return {
            totalLetters: this.letters.length,
            totalWeight: this.totalWeight,
            mostCommon,
            leastCommon,
            averageWeight: this.totalWeight / this.letters.length
        };
    }
}