// eidosk/phaser/grid/match3/Match3GridView.ts - PURE COMPOSITION VERSION
import { Scene } from 'phaser';
import { Match3Grid, Match3Position } from 'eidosk/core';
import { Match3TileFactory, Match3TileConfig, Match3Animator, Match3Matcher,
    Match3InputHandler, Match3InputCallbacks, GridRenderConfig, GridVisualRenderer} from 'eidosk/phaser';

export interface Match3GridConfig {
    rows?: number;
    cols?: number;
    tileSize?: number;
    tileTypes?: number;
    position?: { x: number, y: number };
    padding?: { x: number, y: number };
    tileConfig?: Match3TileConfig;
    onTileSwapped?: (row1: number, col1: number, row2: number, col2: number) => void;
    onMatchFound?: (matches: Match3Position[]) => void;
    onNoMovesLeft?: () => void;
}

export class Match3GridView {
    private readonly scene: Scene;
    private readonly gameGrid: Match3Grid;  // SINGLE SOURCE OF TRUTH
    private visualRenderer: GridVisualRenderer<number, Phaser.GameObjects.Graphics>;
    private tileFactory: Match3TileFactory;
    private readonly tileTypes: number;

    // Composition components
    private match3Animator: Match3Animator;
    private matcher: Match3Matcher;
    private inputHandler: Match3InputHandler;

    // Event callbacks
    private onTileSwapped?: (row1: number, col1: number, row2: number, col2: number) => void;
    private onMatchFound?: (matches: Match3Position[]) => void;
    private onNoMovesLeft?: () => void;

    constructor(scene: Scene, config: Match3GridConfig = {}) {
        // Set defaults
        const rows = config.rows || 8;
        const cols = config.cols || 8;
        const tileSize = config.tileSize || 50;
        const tileTypes = config.tileTypes || 5;
        const padding = config.padding || { x: 2, y: 2 };
        const position = config.position || {
            x: scene.cameras.main.centerX - (cols * (tileSize + padding.x)) / 2,
            y: scene.cameras.main.centerY - (rows * (tileSize + padding.y)) / 2
        };

        // Store references
        this.scene = scene;
        this.tileTypes = tileTypes;
        this.onTileSwapped = config.onTileSwapped;
        this.onMatchFound = config.onMatchFound;
        this.onNoMovesLeft = config.onNoMovesLeft;

        // Create core grid (single source of truth)
        this.gameGrid = new Match3Grid(rows, cols, tileTypes);

        // Create tile factory
        this.tileFactory = new Match3TileFactory(scene, {
            tileTypes,
            ...config.tileConfig
        });

        // Create visual renderer
        const renderConfig: GridRenderConfig = {
            position,
            cellSize: tileSize,
            padding
        };
        this.visualRenderer = new GridVisualRenderer(scene, renderConfig, this.tileFactory);

        // Initialize composition components
        this.initializeComponents();

        // Initialize the grid
        this.initializeMatch3Grid();

        console.log("Match3GridView created: " + rows + "x" + cols + " with " + tileTypes + " tile types");
    }

    private initializeComponents(): void {
        //todo add customAnimationSettings
        //this.match3Animator = new Match3Animator(this.scene, 1.0, customAnimationSettings);
        this.match3Animator = new Match3Animator(this.scene, 1.0);

        // Input handler with callbacks
        const inputCallbacks: Match3InputCallbacks = {
            onTileSwapAttempt: (row1, col1, row2, col2) => this.attemptSwap(row1, col1, row2, col2),
            getTile: (row, col) => this.getTile(row, col)
        };
        this.inputHandler = new Match3InputHandler(this.scene, inputCallbacks);
    }

    private initializeMatch3Grid(): void {
        try {
            // Initialize matcher AFTER gameGrid exists
            this.matcher = new Match3Matcher(this.gameGrid, {
                onMatchFound: this.onMatchFound,
                onNoMovesLeft: this.onNoMovesLeft
            });

            // Delegate grid creation to Match3Grid (single source of truth)
            this.gameGrid.createValidGrid();

            // Render the visual tiles
            this.visualRenderer.render(this.gameGrid);

            // Setup interactions
            this.setupInteractions();

            console.log("Match3GridView: Initialized successfully");
        } catch (error) {
            console.error("Match3GridView: Initialization failed: " + error);
            throw error;
        }
    }

    private setupInteractions(): void {
        this.inputHandler.setupTileInteractions(
            this.gameGrid.getTotRows(),
            this.gameGrid.getTotCols()
        );
    }

    private getTile(row: number, col: number): Phaser.GameObjects.Graphics | null {
        return this.visualRenderer.getTile(row, col);
    }

    private async attemptSwap(row1: number, col1: number, row2: number, col2: number): Promise<void> {
        // Delegate to matcher (which uses gameGrid as single source of truth)
        const success = this.matcher.canSwapTiles(row1, col1, row2, col2);

        if (success) {
            // Get tiles for animation
            const tile1 = this.getTile(row1, col1);
            const tile2 = this.getTile(row2, col2);

            if (tile1 && tile2) {
                // Animate the swap
                await this.match3Animator.animateSwap(tile1, tile2, () => {
                    // Visual renderer handles position updates
                });
            }

            // Notify callback
            if (this.onTileSwapped) {
                this.onTileSwapped(row1, col1, row2, col2);
            }

            // Process any resulting matches
            await this.processMatches();
        } else {
            // Invalid swap - animate rejection
            const tile1 = this.getTile(row1, col1);
            const tile2 = this.getTile(row2, col2);

            if (tile1 && tile2) {
                await this.match3Animator.animateInvalidSwap(tile1, tile2);
            }
        }
    }

    private async processMatches(): Promise<void> {
        this.inputHandler.setProcessing(true);

        try {
            // Delegate match processing to matcher
            await this.matcher.processAllMatches(
                // Handle each cascade
                async (matches: Match3Position[]) => {
                    const tiles = matches.map(match => this.getTile(match.row, match.col))
                        .filter(tile => tile !== null) as Phaser.GameObjects.Graphics[];

                    await this.match3Animator.animateMatchRemoval(tiles, (tile) => {
                        // Tile cleanup handled by animator
                    });
                },
                // Handle gravity and fill
                async () => {
                    await this.applyGravityAndFill();
                }
            );
        } finally {
            this.inputHandler.setProcessing(false);
        }
    }

    private async applyGravityAndFill(): Promise<void> {
        try {
            // Simple approach: remove matches from core data, then re-render
            // GameCore grid handles gravity logic internally
            const affectedCols = this.gameGrid.getColumnsWithEmptyCells();

            for (const col of affectedCols) {
                this.gameGrid.moveDownCellsAtCol(col);
            }

            this.gameGrid.fillEmptyTopCells();

            // Re-render with updated grid
            this.visualRenderer.render(this.gameGrid);

            console.log("Gravity and fill completed");
            this.setupInteractions();
        } catch (error) {
            console.error("Match3GridView: applyGravityAndFill failed: " + error);
        }
    }

    // ========================================
    // PUBLIC API - All delegate to single data source
    // ========================================

    findMatches(): Match3Position[] {
        return this.matcher.findMatches();
    }

    getPossibleMoves(): Array<{ from: Match3Position, to: Match3Position }> {
        return this.matcher.getPossibleMoves();
    }

    hasPossibleMoves(): boolean {
        return this.matcher.hasPossibleMoves();
    }

    getStats(): {
        totalTiles: number;
        emptyTiles: number;
        tileTypeCounts: { [key: number]: number };
        possibleMoves: number;
    } {
        return this.matcher.getStats();
    }

    async triggerMatchProcessing(): Promise<void> {
        await this.processMatches();
    }

    setInteractive(enabled: boolean): void {
        this.inputHandler.setInteractive(enabled, this.gameGrid.getTotRows(), this.gameGrid.getTotCols());
    }

    showHint(): boolean {
        const possibleMoves = this.matcher.getPossibleMoves();

        if (possibleMoves.length === 0) {
            return false;
        }

        const hint = possibleMoves[0];
        const tile1 = this.getTile(hint.from.row, hint.from.col);
        const tile2 = this.getTile(hint.to.row, hint.to.col);

        if (tile1 && tile2) {
            this.match3Animator.animateHint([tile1, tile2]);
        }

        return true;
    }

    isValidState(): boolean {
        return this.matcher.isValidState();
    }

    getGameGrid(): Match3Grid {
        return this.gameGrid;
    }

    resetGrid(): void {
        try {
            console.log("Resetting grid...");

            // Clear selection
            this.inputHandler.clearSelection();

            // Delegate grid creation to Match3Grid (single source of truth)
            this.gameGrid.createValidGrid();

            // Re-render visual tiles
            this.visualRenderer.render(this.gameGrid);

            // Re-setup interactions
            this.setupInteractions();

            console.log("Grid reset successfully");
        } catch (error) {
            console.error("Match3GridView: Failed to reset grid: " + error);
        }
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

    // ========================================
    // CLEANUP
    // ========================================

    destroy(): void {
        // Destroy composition components
        this.match3Animator?.destroy();
        this.matcher?.destroy();
        this.inputHandler?.destroy();
        this.visualRenderer?.destroy();

        // Clear callbacks
        this.onTileSwapped = undefined;
        this.onMatchFound = undefined;
        this.onNoMovesLeft = undefined;

        console.log("Match3GridView: Destroyed");
    }
}