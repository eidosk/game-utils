import { GravityGrid, GridCache, WordDictionary, LetterGridConfig,
    WordValidator, WordPathFinder, LetterGenerator, GridPosition,
    WordPath, LetterGridOptions, GridShapeFunction, GridShapes } from 'eidosk/core';

export class LetterGrid extends GravityGrid<string> {
    private batchMode: boolean = false;
    private readonly dictionary: WordDictionary;
    private readonly validator: WordValidator;
    private readonly pathFinder: WordPathFinder;
    private readonly letterGen: LetterGenerator;
    private readonly cache: GridCache<string>;

    constructor(
        rows: number,
        cols: number,
        dictionary: string[] = [],
        options: LetterGridOptions = {},
        shape?: GridShapeFunction
    ) {
        super(rows, cols);

        const config = new LetterGridConfig(options);
        this.dictionary = new WordDictionary();
        this.letterGen = config.createLetterGenerator();
        this.pathFinder = config.createPathFinder();
        this.cache = new GridCache<string>();  // Create cache first

        this.setShape(shape || GridShapes.rectangle);  // Then set shape

        if (dictionary.length > 0) {
            this.dictionary.addWords(dictionary);
        }

        this.validator = config.createValidator(
            this.dictionary.getTrie(),
            options.commonWords
        );
    }

    setShape(shape: GridShapeFunction): void {
        super.setShape(shape);
        this.cache.clear();
    }

    getShape(): GridShapeFunction {
        return super.getShape() || GridShapes.rectangle;
    }

    // Cell generation
    createNewCell(): string { return this.letterGen.generateLetter(); }

    fillEmptyCells(): void {
        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                if (this.isCellActive(row, col) && !this.getCell(row, col)) {
                    this.setCell(row, col, this.createNewCell());
                }
            }
        }
    }

    fillWithRandomLetters(): void {
        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                if (this.isCellActive(row, col)) {
                    this.setCell(row, col, this.createNewCell());
                }
            }
        }
        this.cache.invalidate(this.getAsArray());
    }

    clear(): void {
        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                this.setCell(row, col, undefined);
            }
        }
        this.cache.invalidate(this.getAsArray());
    }

    removeLetters(positions: GridPosition[]): void {
        for (const pos of positions) {
            this.setCell(pos.row, pos.col, undefined);
        }
        this.cache.invalidate(this.getAsArray());
    }

    // Word validation
    validateWordPath(path: GridPosition[]): any {
        return this.validator.validateWordPath(this.getAsArray(), path);
    }

    validateWordPathWithWildcards(path: GridPosition[], wildcardPositions: number[]): any {
        return this.validator.validateWordPathWithWildcards(this.getAsArray(), path, wildcardPositions);
    }

    findAllPossibleWords(): WordPath[] {
        if (this.cache.isCacheValid(this.getAsArray())) {
            const cached = this.cache.getAllWords();
            if (cached) return cached;
        }

        const result = this.pathFinder.findAllPossibleWords(
            this.getAsArray(), this.dictionary.getWordSet(), this.validator.getScorer()
        );

        this.cache.setAllWords(result);
        return result;
    }


    fillEmptyTopCells(): GridPosition[] {
        this.beginBatch();

        for (const col of this.getColumnsWithEmptyCells()) {
            this.moveDownCellsAtCol(col);
        }

        const emptyPositions = this.getEmptyTopPositions();

        // Simple random fill - subclasses can override
        for (const pos of emptyPositions) {
            this.setCell(pos.row, pos.col, this.createNewCell());
        }

        this.endBatch();
        return emptyPositions;
    }

    beginBatch(): void {
        this.batchMode = true;
    }

    endBatch(): void {
        this.batchMode = false;
        this.cache.invalidate(this.getAsArray());
    }

    protected getEmptyTopPositions(): GridPosition[] {
        const positions: GridPosition[] = [];
        for (let col = 0; col < this.getTotCols(); col++) {
            for (let row = 0; row < this.getTotRows(); row++) {
                if (this.isCellActive(row, col) && !this.getCell(row, col)) {
                    positions.push({ row, col });
                } else if (this.getCell(row, col)) {
                    break;
                }
            }
        }
        return positions;
    }
}