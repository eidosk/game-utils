export type LetterValueSystem = 'scrabble' | 'uniform' | Record<string, number>;

export class LetterValues {
    private letterValues: { [key: string]: number };

    constructor(system: LetterValueSystem = 'scrabble') {
        if (system === 'scrabble') {
            this.initializeScrabbleValues();
        } else if (system === 'uniform') {
            this.initializeUniformValues();
        } else {
            this.letterValues = system as Record<string, number>;
        }
    }

    getLetterValue(letter: string): number {
        return this.letterValues[letter.toUpperCase()] || 1;
    }

    private initializeScrabbleValues(): void {
        this.letterValues = {
            'A': 1, 'E': 1, 'I': 1, 'O': 1, 'U': 1, 'L': 1, 'N': 1, 'R': 1, 'S': 1, 'T': 1,
            'D': 2, 'G': 2,
            'B': 3, 'C': 3, 'M': 3, 'P': 3,
            'F': 4, 'H': 4, 'V': 4, 'W': 4, 'Y': 4,
            'K': 5,
            'J': 8, 'X': 8,
            'Q': 10, 'Z': 10
        };
    }

    private initializeUniformValues(): void {
        this.letterValues = {};
        for (let i = 65; i <= 90; i++) {
            this.letterValues[String.fromCharCode(i)] = 1;
        }
    }
}