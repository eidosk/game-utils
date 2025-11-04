import { LetterValues } from 'eidosk/core';

export interface TileMultiplier {
    letterMultiplier?: number;
    wordMultiplier?: number;
}

export class ScrabbleScorer {
    private letterValues: LetterValues;

    constructor(letterValueSystem: 'scrabble' | 'uniform' | Record<string, number> = 'scrabble') {
        this.letterValues = new LetterValues(letterValueSystem);
    }

    calculateScore(word: string, tileMultipliers?: TileMultiplier[]): number {
        let total = 0;
        let wordMult = 1;

        for (let i = 0; i < word.length; i++) {
            let value = this.letterValues.getLetterValue(word[i].toUpperCase());
            const mult = tileMultipliers && tileMultipliers[i];
            if (mult) {
                if (mult.letterMultiplier) value *= mult.letterMultiplier;
                if (mult.wordMultiplier) wordMult *= mult.wordMultiplier;
            }
            total += value;
        }

        return Math.round(total * wordMult);
    }

    getLetterValue(letter: string): number {
        return this.letterValues.getLetterValue(letter.toUpperCase());
    }
}
