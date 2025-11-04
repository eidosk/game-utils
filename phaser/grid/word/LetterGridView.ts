// eidosk/phaser/grid/word/LetterGridView.ts
import { Scene } from 'phaser';
import { LetterGrid, GridPosition, WordDictionary, EventBus, GridShapeFunction, ScrabbleScorer } from 'eidosk/core';
import {
    LetterGridAnimator, GridVisualRenderer, GridRenderConfig, LetterTile,
    LetterTileFactory, TileFactory, CursorManager
} from 'eidosk/phaser';

export interface LetterGridConfig {
    rows?: number;
    cols?: number;
    tileSize?: number;
    dictionary?: string[];
    position?: { x: number, y: number };
    padding?: { x: number, y: number };
    onWordFound?: (word: string, score: number, path: GridPosition[]) => void;
    onWordInvalid?: (word: string, reason: string) => void;
    eventBus?: EventBus;
    letters?: string;
    shape?: GridShapeFunction;
    tileFactory?: TileFactory<string>;
    tileTextureKey?: string;
    cursorManager?: CursorManager;
}

export abstract class LetterGridView {
    protected readonly scene: Scene;
    protected letterGrid: LetterGrid;
    protected visualRenderer: GridVisualRenderer<string, LetterTile>;
    protected inputHandler: any; // Child class defines specific type
    protected letterAnimator: LetterGridAnimator;
    protected tileFactory: TileFactory<string>;

    protected readonly onWordFound?: (word: string, score: number, path: GridPosition[]) => void;
    protected readonly onWordInvalid?: (word: string, reason: string) => void;
    protected tileSize: number;
    protected padding: { x: number; y: number };
    protected readonly eventBus?: EventBus;
    protected readonly centerPosition: { x: number, y: number };
    protected cursorManager?: CursorManager;

    constructor(scene: Scene, config: LetterGridConfig = {}) {
        this.scene = scene;
        const rows = config.rows || 6;
        const cols = config.cols || 6;
        this.tileSize = config.tileSize || 60;
        this.padding = config.padding || { x: 2, y: 2 };
        this.cursorManager = config.cursorManager;

        this.centerPosition = config.position || {
            x: scene.cameras.main.centerX,
            y: scene.cameras.main.centerY
        };

        const position = {
            x: this.centerPosition.x - (cols * (this.tileSize + this.padding.x)) / 2,
            y: this.centerPosition.y - (rows * (this.tileSize + this.padding.y)) / 2
        };

        this.onWordFound = config.onWordFound;
        this.onWordInvalid = config.onWordInvalid;
        this.eventBus = config.eventBus;

        let dictionaryWords: string[] = [];
        if (config.dictionary && config.dictionary.length > 0) {
            dictionaryWords = config.dictionary;
        } else {
            const basicDict = WordDictionary.createBasicEnglish();
            dictionaryWords = basicDict.getAllWords();
        }

        this.letterGrid = this.createLetterGrid(rows, cols, dictionaryWords, config.shape);
        // ❌ REMOVED: this.letterGrid.fillWithRandomLetters();

        const renderConfig: GridRenderConfig = {
            position,
            cellSize: this.tileSize,
            padding: this.padding
        };

        const scorer: ScrabbleScorer = new ScrabbleScorer();
        this.tileFactory = config.tileFactory
            || new LetterTileFactory(scene, scorer, { textureKey: config.tileTextureKey || "aa" });

        this.visualRenderer = new GridVisualRenderer<string, LetterTile>(scene, renderConfig, this.tileFactory);
        this.letterAnimator = new LetterGridAnimator(scene);

        // ❌ REMOVED: this.visualRenderer.render(this.letterGrid);

        if (this.eventBus) {
            this.eventBus.on('tiles:swap', this.onTilesSwap, this);
        }
    }

    protected createLetterGrid(rows: number, cols: number, dictionary: string[], shape?: GridShapeFunction): LetterGrid {
        return new LetterGrid(rows, cols, dictionary, {
            minWordLength: 3,
            maxWordLength: 8
        }, shape);
    }

    protected async onTilesSwap(data: { tile1: LetterTile, tile2: LetterTile }): Promise<void> {
        const pos1 = { row: data.tile1.row, col: data.tile1.col };
        const pos2 = { row: data.tile2.row, col: data.tile2.col };

        await this.letterAnimator.animateTileSwap(
            data.tile1,
            data.tile2,
            this.getPosition(pos2.row, pos2.col),
            this.getPosition(pos1.row, pos1.col)
        );

        const letter1 = this.letterGrid.getCell(pos1.row, pos1.col) || '';
        const letter2 = this.letterGrid.getCell(pos2.row, pos2.col) || '';

        this.letterGrid.setCell(pos1.row, pos1.col, letter2);
        this.letterGrid.setCell(pos2.row, pos2.col, letter1);

        this.visualRenderer.swapTiles(pos1, pos2);

        data.tile1.updatePosition(pos2.row, pos2.col);
        data.tile2.updatePosition(pos1.row, pos1.col);

        const allTiles = this.visualRenderer.getAllTiles();
        for (let row = 0; row < allTiles.length; row++) {
            for (let col = 0; col < allTiles[row].length; col++) {
                const tile = allTiles[row][col];
                if (tile) {
                    this.removeHoverEffect(tile);
                }
            }
        }

        this.setupInput();

        if (this.eventBus) {
            this.eventBus.emit('tiles:swap:complete');
        }
    }

    protected abstract setupInput(cursorManager?: CursorManager): void;

    protected highlightPath(path: GridPosition[]): void {
        const allTiles = this.visualRenderer.getAllTiles();
        for (let row = 0; row < allTiles.length; row++) {
            for (let col = 0; col < allTiles[row].length; col++) {
                const tile = allTiles[row][col];
                if (tile) {
                    tile.isHighlighted = false;
                    this.removeHoverEffect(tile);
                }
            }
        }

        const selectedTiles = this.visualRenderer.getTilesAtPositions(path);
        selectedTiles.forEach(tile => {
            if (tile) {
                tile.isHighlighted = true;
                this.addHoverEffect(tile);
            }
        });
    }

    protected addHoverEffect(tile: LetterTile): void {
        const container = tile.object;
        const image = container.getAt(0) as Phaser.GameObjects.Image;
        if (image && image.type === 'Image') {
            (container as any)._originalTexture = image.texture.key;
            const hoverTexture = image.texture.key + "_hover";
            if (this.scene.textures.exists(hoverTexture)) {
                image.setTexture(hoverTexture);
            }
        }
    }

    protected removeHoverEffect(tile: LetterTile): void {
        const container = tile.object;
        const image = container.getAt(0) as Phaser.GameObjects.Image;
        if (image && image.type === 'Image') {
            const originalTexture = (container as any)._originalTexture;
            if (originalTexture && this.scene.textures.exists(originalTexture)) {
                image.setTexture(originalTexture);
            }
        }
    }


    protected async validateWord(path: GridPosition[], word: string): Promise<void> {
        const validation = this.letterGrid.validateWordPath(path);

        if (validation.isValid) {
            console.log("Valid word: " + validation.word + " (score: " + validation.score + ")");

            if (this.onWordFound) {
                this.onWordFound(validation.word, validation.score, path);
            }

            await this.processFoundWord(path);
        } else {
            console.log("Invalid word: " + word + " - " + validation.reason);
            if (this.onWordInvalid) {
                this.onWordInvalid(word, validation.reason || 'Invalid');
            }
        }

        this.highlightPath([]);
    }

    public async processFoundWord(path: GridPosition[], skipRefill: boolean = false): Promise<void> {
        try {
            const tilesToRemove = this.visualRenderer.getTilesAtPositions(path)
                .filter(tile => tile !== null) as LetterTile[];

            await this.letterAnimator.animateLetterRemoval(tilesToRemove, () => {});

            this.letterGrid.removeLetters(path);

            await this.letterAnimator.animateWordRemovalAndRefill(
                path,
                this.letterGrid,
                this.visualRenderer,
                (row, col) => this.getPosition(row, col),
                skipRefill  // ✅ Pass flag
            );

            this.setupInput();
        } catch (error) {
            console.error("Failed to process found word:", error);
        }
    }

    protected getPosition(row: number, col: number): { x: number, y: number } {
        const cellSize = this.tileSize;
        const padding = this.padding;

        return {
            x: col * (cellSize + padding.x) + cellSize / 2,
            y: row * (cellSize + padding.y) + cellSize / 2
        };
    }

    protected isAdjacent(currentPath: GridPosition[], newPos: GridPosition): boolean {
        if (currentPath.length === 0) return true;

        const lastPos = currentPath[currentPath.length - 1];
        const rowDiff = Math.abs(lastPos.row - newPos.row);
        const colDiff = Math.abs(lastPos.col - newPos.col);

        return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
    }

    // Public API
    resetGrid(): void {
        this.letterGrid.fillWithRandomLetters();
        this.visualRenderer.render(this.letterGrid);
        this.setupInput();
    }

    getLetterGrid(): LetterGrid {
        return this.letterGrid;
    }

    public getVisualRenderer(): GridVisualRenderer<string, LetterTile> {
        return this.visualRenderer;
    }

    public getCenterPosition(): { x: number, y: number } {
        return this.centerPosition;
    }

    public getTileSize(): number {
        return this.tileSize;
    }

    public getPadding(): { x: number, y: number } {
        return this.padding;
    }

    setPosition(x: number, y: number): void {
        this.visualRenderer.setPosition(x, y);
    }

    setVisible(visible: boolean): void {
        this.visualRenderer.setVisible(visible);
    }

    setAlpha(alpha: number): void {
        this.visualRenderer.setAlpha(alpha);
    }

    get gameObject(): Phaser.GameObjects.Container {
        return this.visualRenderer.getContainer();
    }

    destroy(): void {
        if (this.eventBus) {
            this.eventBus.off('tiles:swap', this.onTilesSwap, this);
        }
        this.inputHandler?.destroy();
        this.visualRenderer?.destroy();
        this.letterAnimator?.destroy();
    }
}