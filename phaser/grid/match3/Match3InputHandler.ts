import { Scene } from 'phaser';
import { GridInputHandler, InputHandlerCallbacks, TileGameObject } from 'eidosk/phaser';

export interface Match3InputCallbacks extends InputHandlerCallbacks {
    // Called when user attempts to swap two adjacent tiles
    onTileSwapAttempt: (row1: number, col1: number, row2: number, col2: number) => Promise<void>;

    // ✅ FIX: Use existing TileGameObject type instead of non-existent Match3Tile
    getTile: (row: number, col: number) => TileGameObject | null;

    // Optional: Check if tile can be selected (for future features)
    canSelectTile?: (row: number, col: number) => boolean;

    // Optional: Called when tile is selected/highlighted
    onTileSelected?: (row: number, col: number) => void;

    // Optional: Called when selection is cleared
    onSelectionCleared?: () => void;
}

export class Match3InputHandler extends GridInputHandler {
    private selectedTile: { row: number, col: number } | null = null;
    private match3Callbacks: Match3InputCallbacks;

    constructor(scene: Scene, callbacks: Match3InputCallbacks) {
        super(scene, callbacks);
        this.match3Callbacks = callbacks;
    }

    // ✅ Implement game-specific abstract methods
    protected async onTileClicked(row: number, col: number): Promise<void> {
        if (this.isProcessing) {
            return;
        }

        console.log("Match3 tile clicked: " + row + ", " + col);

        if (!this.selectedTile) {
            // First tile selection
            this.selectTile(row, col);
        } else {
            // Second tile selection - try to swap
            if (this.selectedTile.row === row && this.selectedTile.col === col) {
                // Same tile clicked - deselect
                this.deselectTile();
            } else {
                // Try to swap tiles
                await this.attemptSwap(this.selectedTile.row, this.selectedTile.col, row, col);
            }
        }
    }

    protected canInteractWithTile(row: number, col: number): boolean {
        // Match3: can interact with any tile that exists
        const tile = this.callbacks.getTile(row, col);
        return tile !== null;
    }

    protected isTileSelected(row: number, col: number): boolean {
        return this.selectedTile !== null &&
            this.selectedTile.row === row &&
            this.selectedTile.col === col;
    }

    public clearSelection(): void {
        this.deselectTile();
    }

    public hasSelection(): boolean {
        return this.selectedTile !== null;
    }

    // ✅ Match3-specific selection methods
    private selectTile(row: number, col: number): void {
        this.selectedTile = { row, col };
        const tile = this.callbacks.getTile(row, col);
        if (tile) {
            // Use alpha to indicate selection
            tile.setAlpha(0.7);
            tile.setScale(1.1);
        }
        console.log("Selected tile: " + row + ", " + col);

        // Optional callback
        if (this.match3Callbacks.onTileSelected) {
            this.match3Callbacks.onTileSelected(row, col);
        }
    }

    private deselectTile(): void {
        if (this.selectedTile) {
            const tile = this.callbacks.getTile(this.selectedTile.row, this.selectedTile.col);
            if (tile) {
                tile.setAlpha(1.0);
                tile.setScale(1.0);
            }
            this.selectedTile = null;

            // Optional callback
            if (this.match3Callbacks.onSelectionCleared) {
                this.match3Callbacks.onSelectionCleared();
            }
        }
    }

    private async attemptSwap(row1: number, col1: number, row2: number, col2: number): Promise<void> {
        this.setProcessing(true);

        try {
            // Delegate to parent for swap logic
            await this.match3Callbacks.onTileSwapAttempt(row1, col1, row2, col2);
        } catch (error) {
            console.error("Match3InputHandler: Swap attempt failed: " + error);
        } finally {
            this.deselectTile();
            this.setProcessing(false);
        }
    }

    // ✅ Override processing state change to update selected tile
    protected onProcessingStateChanged(processing: boolean): void {
        if (this.selectedTile && processing) {
            const tile = this.callbacks.getTile(this.selectedTile.row, this.selectedTile.col);
            if (tile) {
                tile.setAlpha(0.5);
            }
        }
    }

    // ✅ Match3-specific getters
    getSelection(): { row: number, col: number } | null {
        return this.selectedTile;
    }

    // ✅ Cleanup
    destroy(): void {
        this.deselectTile();
        super.destroy();
    }
}