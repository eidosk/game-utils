import { Scene } from "phaser";

/**
 * Configuration for PreloaderBar
 */
export interface PreloaderBarConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    backingColor: number;   // Required (not optional)
    barColor: number;       // Required (not optional)
    borderColor: number;    // Required (not optional)
    borderWidth: number;    // Required (not optional)
}

/**
 * A simple graphics-based progress bar for use during preloading
 * before texture assets are available.
 */
export class PreloaderBar {
    protected scene: Scene;
    protected backing: Phaser.GameObjects.Graphics;
    protected bar: Phaser.GameObjects.Graphics;
    protected config: PreloaderBarConfig;
    protected progress: number = 0;

    constructor(scene: Scene, config: Partial<PreloaderBarConfig>) {
        this.scene = scene;

        // Set all defaults in one place
        this.config = {
            // Required properties
            x: config.x ?? 0,
            y: config.y ?? 0,
            width: config.width ?? 100,
            height: config.height ?? 20,

            // Properties with defaults
            backingColor: config.backingColor ?? 0x000000,
            barColor: config.barColor ?? 0x8cd1c8,
            borderColor: config.borderColor ?? 0xffffff,
            borderWidth: config.borderWidth ?? 0
        };

        this.backing = scene.add.graphics();
        this.bar = scene.add.graphics();

        this.drawBacking();
        this.updateProgress(0);
    }

    private drawBacking(): void {
        this.backing.clear();

        // Draw backing - no nullish check needed since we know properties exist
        this.backing.fillStyle(this.config.backingColor, 1);
        this.backing.fillRect(
            this.config.x - this.config.width / 2,
            this.config.y - this.config.height / 2,
            this.config.width,
            this.config.height
        );

        // Draw border if requested
        if (this.config.borderWidth > 0) {
            this.backing.lineStyle(this.config.borderWidth, this.config.borderColor, 1);
            this.backing.strokeRect(
                this.config.x - this.config.width / 2,
                this.config.y - this.config.height / 2,
                this.config.width,
                this.config.height
            );
        }
    }

    /**
     * Updates the progress bar visualization
     * @param progress Progress value between 0 and 1
     */
    updateProgress(progress: number): void {
        this.progress = Math.min(Math.max(progress, 0), 1);
        const barWidth = this.config.width * this.progress;

        this.bar.clear();
        this.bar.fillStyle(this.config.barColor, 1); // No nullish check needed
        this.bar.fillRect(
            this.config.x - this.config.width / 2,
            this.config.y - this.config.height / 2,
            barWidth,
            this.config.height
        );
    }

    /**
     * Gets the current progress value
     * @returns Progress value between 0 and 1
     */
    getProgress(): number {
        return this.progress;
    }

    /**
     * Sets the position of the progress bar
     * @param x X coordinate
     * @param y Y coordinate
     * @returns this, for method chaining
     */
    setPosition(x: number, y: number): this {
        this.config.x = x;
        this.config.y = y;

        this.drawBacking();
        this.updateProgress(this.progress);
        return this;
    }

    /**
     * Changes the bar's visibility
     * @param visible Whether the bar should be visible
     * @returns this, for method chaining
     */
    setVisible(visible: boolean): this {
        this.backing.setVisible(visible);
        this.bar.setVisible(visible);
        return this;
    }

    /**
     * Changes the bar's alpha transparency
     * @param alpha Alpha value (0-1)
     * @returns this, for method chaining
     */
    setAlpha(alpha: number): this {
        this.backing.setAlpha(alpha);
        this.bar.setAlpha(alpha);
        return this;
    }

    /**
     * Destroys the progress bar graphics objects
     */
    destroy(): void {
        this.backing.destroy();
        this.bar.destroy();
    }
}