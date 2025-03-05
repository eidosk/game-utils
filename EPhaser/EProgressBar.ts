import { Scene } from "phaser";

export interface ProgressBarConfig {
    position: { x: number, y: number };
    progressBarOutlineTexture: string;
    progressBarTexture: string;
}

export class EProgressBar extends Phaser.GameObjects.Container {
    protected tScale: number;
    protected startX: number;
    protected progressBarOutline: Phaser.GameObjects.Image;
    protected progressBarFull: Phaser.GameObjects.Image;

    constructor(scene: Scene, progressBarConfig: ProgressBarConfig) {
        const { position, progressBarOutlineTexture, progressBarTexture } = progressBarConfig;

        super(scene);
        this.scene = scene;
        this.tScale = 2; // Scale factor for the bar
        this.startX = position.x;

        // Create the outline and fill images
        this.progressBarOutline = this.scene.add.image(position.x, position.y, progressBarOutlineTexture).setScale(this.tScale);
        this.progressBarFull = this.scene.add.image(position.x, position.y, progressBarTexture).setScale(this.tScale);

        // Add to container and scene
        this.add(this.progressBarOutline);
        this.add(this.progressBarFull);
        this.scene.add.existing(this);

        // Create a mask to clip the progress bar fill
        let shape = this.scene.add.graphics();
        let tWidth = this.progressBarFull.width * this.tScale;
        let tHeight = this.progressBarFull.height * this.tScale;

        shape.fillStyle(0xffffff, 0); // Transparent fill for mask
        shape.fillRect(position.x - tWidth * 0.5, position.y - tHeight * 0.5, tWidth, tHeight);

        this.progressBarFull.mask = shape.createGeometryMask();
        this.updateProgress(0);
    }

    // Update the progress (0 to 1)
    updateProgress(progress: number): void {
        progress = Math.min(Math.max(progress, 0), 1); // Clamp between 0 and 1
        this.progressBarFull.x = this.startX - this.progressBarFull.width * (1 - progress) * this.tScale;
    }
}