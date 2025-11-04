// eidosk/phaser/grid/GridInputHandler.ts
import { Scene } from 'phaser';

export interface InputHandlerCallbacks<TileType = any> {
    getTile: (row: number, col: number) => TileType | null;
}

export abstract class GridInputHandler {
    protected scene: Scene;
    protected callbacks: InputHandlerCallbacks;
    protected isProcessing: boolean = false;

    protected constructor(scene: Scene, callbacks: InputHandlerCallbacks) {
        this.scene = scene;
        this.callbacks = callbacks;
    }

    setupTileInteractions(rows: number, cols: number): void {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const tile = this.callbacks.getTile(row, col);
                if (tile) {
                    this.setupSingleTileInteraction(tile, row, col);
                }
            }
        }
    }

    private setupSingleTileInteraction(tile: any, row: number, col: number): void {
        const phaserObj = this.getPhaserObject(tile);
        if (!phaserObj) return;

        (phaserObj as any).gridRow = row;
        (phaserObj as any).gridCol = col;

        phaserObj.removeAllListeners('pointerdown');
        phaserObj.removeAllListeners('pointerover');
        phaserObj.removeAllListeners('pointerout');

        phaserObj.setInteractive();
        phaserObj.on('pointerdown', () => this.onTileClicked(row, col));
        phaserObj.on('pointerover', () => this.onTileHover(phaserObj, row, col));
        phaserObj.on('pointerout', () => this.onTileHoverEnd(phaserObj, row, col));
    }

    protected getPhaserObject(tile: any): Phaser.GameObjects.GameObject | null {
        if ((tile as any).object) {
            return (tile as any).object;
        }
        return tile;
    }

    protected getGridCoordinatesFromObject(obj: Phaser.GameObjects.GameObject): { row: number, col: number } | null {
        if ((obj as any).gridRow !== undefined && (obj as any).gridCol !== undefined) {
            return {
                row: (obj as any).gridRow,
                col: (obj as any).gridCol
            };
        }
        return null;
    }

    setProcessing(processing: boolean): void {
        this.isProcessing = processing;
    }

    protected abstract onTileClicked(row: number, col: number): void;
    protected abstract onTileHover(obj: Phaser.GameObjects.GameObject, row: number, col: number): void;
    protected abstract onTileHoverEnd(obj: Phaser.GameObjects.GameObject, row: number, col: number): void;

    destroy(): void {
        this.callbacks = {} as InputHandlerCallbacks;
    }
}