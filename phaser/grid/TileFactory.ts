// eidosk/phaser/grid/TileFactory.ts
import { Scene } from 'phaser';
import { CellDataType } from 'eidosk/core';

export interface TileConfig {
    x: number;
    y: number;
    row: number;
    col: number;
    size: number;
}

export abstract class TileFactory<T extends CellDataType> {
    protected scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * Create a tile from cell data
     * @param config - Position and size configuration
     * @param cellData - The data to represent visually
     * @returns The created tile object
     */
    abstract createTile(config: TileConfig, cellData: T): any; //in this case any is good practic

    /**
     * Optional: Create an empty/background tile for visualization
     * @param config - Position and size configuration
     * @returns Graphics tile for empty cells
     */
    createGraphicsTile(config: TileConfig): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();

        // Create empty/background tile - CENTERED
        graphics.fillStyle(0x333333, 0.2);
        graphics.fillRoundedRect(-config.size/2, -config.size/2, config.size, config.size, 4);

        // Add border
        graphics.lineStyle(1, 0x666666, 0.5);
        graphics.strokeRoundedRect(-config.size/2, -config.size/2, config.size, config.size, 4);

        // Position the tile
        graphics.x = config.x;
        graphics.y = config.y;

        return graphics;
    }
}