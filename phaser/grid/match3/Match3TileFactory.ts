// eidosk/phaser/grid/match3/Match3TileFactory.ts
import { Scene } from 'phaser';
import { TileFactory, TileConfig } from '../TileFactory';

export interface Match3TileConfig {
    tileTypes?: number;
    colors?: number[];
    borderWidth?: number;
    borderColor?: number;
}

// Simple Graphics object for visual representation (not a "tile" component)
type TileGraphics = Phaser.GameObjects.Graphics;

// ✅ FIX: Use generic Graphics type - no custom "tile" naming
export class Match3TileFactory extends TileFactory<number, TileGraphics> {
    private colors: number[];
    private borderWidth: number;
    private borderColor: number;

    constructor(scene: Scene, config: Match3TileConfig = {}) {
        super(scene);

        const tileTypes = config.tileTypes || 5;
        this.borderWidth = config.borderWidth || 2;
        this.borderColor = config.borderColor || 0x333333;

        // Default colors for different tile types
        this.colors = config.colors || [
            0xff6b6b, // Red (type 1)
            0x4ecdc4, // Teal (type 2)
            0x45b7d1, // Blue (type 3)
            0xf9ca24, // Yellow (type 4)
            0x6c5ce7, // Purple (type 5)
            0xa0e7e5, // Light Teal (type 6)
            0xffeaa7, // Light Yellow (type 7)
            0xfd79a8  // Pink (type 8)
        ].slice(0, tileTypes);
    }

    // ✅ FIX: Now correctly implements TileFactory<number, TileGraphics>
    createTile(config: TileConfig, tileType: number): TileGraphics {
        const graphics = this.scene.add.graphics();

        // Get color for tile type (1-indexed, so subtract 1 for array)
        const colorIndex = Math.max(0, Math.min(tileType - 1, this.colors.length - 1));
        const tileColor = this.colors[colorIndex];

        // Create centered tile
        graphics.fillStyle(tileColor);
        graphics.fillRoundedRect(-config.size/2, -config.size/2, config.size, config.size, 6);

        // Add border
        if (this.borderWidth > 0) {
            graphics.lineStyle(this.borderWidth, this.borderColor, 1);
            graphics.strokeRoundedRect(-config.size/2, -config.size/2, config.size, config.size, 6);
        }

        // Add 3D effect
        graphics.fillStyle(0xffffff, 0.4);
        graphics.fillRoundedRect(-config.size/2 + 2, -config.size/2 + 2, config.size - 4, config.size / 8, 3);

        graphics.fillStyle(0x000000, 0.2);
        graphics.fillRoundedRect(-config.size/2 + 2, config.size/2 - config.size / 8, config.size - 4, config.size / 10, 3);

        // Position the tile
        graphics.x = config.x;
        graphics.y = config.y;

        // Make interactive
        graphics.setInteractive(new Phaser.Geom.Rectangle(-config.size/2, -config.size/2, config.size, config.size), Phaser.Geom.Rectangle.Contains);
        if (graphics.input) graphics.input.cursor = 'pointer';

        return graphics;
    }

    /**
     * Update tile colors for themes
     */
    updateColors(newColors: number[]): void {
        this.colors = [...newColors];
    }

    /**
     * Get color for tile type
     */
    getColorForType(tileType: number): number {
        const colorIndex = Math.max(0, Math.min(tileType - 1, this.colors.length - 1));
        return this.colors[colorIndex];
    }
}