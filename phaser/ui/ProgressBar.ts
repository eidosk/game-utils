import { Scene, Point } from "../types";

export interface ProgressBarConfig {
    position: Point;
    progressBarOutlineTexture: string;
    progressBarTexture: string;
    scale?: number;
}

export class ProgressBar {
    protected container: Phaser.GameObjects.Container;
    protected progressBarOutline: Phaser.GameObjects.Image;
    protected progressBarFull: Phaser.GameObjects.Image;
    protected progress: number;
    protected barScale: number;
    protected frameWidth: number;
    protected frameHeight: number;

    constructor(scene: Scene, config: ProgressBarConfig) {
        const { position, progressBarOutlineTexture, progressBarTexture } = config;

        this.barScale = config.scale ?? 2;
        this.progress = 0;

        // Create container at requested world position
        this.container = scene.add.container(position.x, position.y);

        // Create images, center origins so cropping/positioning is predictable
        this.progressBarOutline = scene.add.image(0, 0, progressBarOutlineTexture)
            .setOrigin(0.5)
            .setScale(this.barScale);

        this.progressBarFull = scene.add.image(0, 0, progressBarTexture)
            .setOrigin(0.5)
            .setScale(this.barScale);
        // Cache unscaled frame size (frame width/height are in texture pixels)
        this.frameWidth = this.progressBarFull.width;
        this.frameHeight = this.progressBarFull.height;

        this.container.add([this.progressBarOutline, this.progressBarFull]);

        // Initialize to zero progress (will apply initial crop)
        this.updateProgress(0);
    }

    updateProgress(progress: number): void {
        this.progress = Phaser.Math.Clamp(progress, 0, 1);
        const cropWidth = this.progressBarFull.width * this.progress;
        this.progressBarFull.setCrop(0, 0, cropWidth, this.progressBarFull.height);
    }
    getProgress(): number {
        return this.progress;
    }

    setPosition(x: number, y: number): this {
        this.container.setPosition(x, y);
        return this;
    }

    setAlpha(alpha: number): this {
        this.container.setAlpha(alpha);
        return this;
    }

    setVisible(visible: boolean): this {
        this.container.setVisible(visible);
        return this;
    }

    destroy(): void {
        this.progressBarFull?.destroy();
        this.progressBarOutline?.destroy();
        this.container?.destroy();
    }

    get gameObject(): Phaser.GameObjects.Container {
        return this.container;
    }
}
