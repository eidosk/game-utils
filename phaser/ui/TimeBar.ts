import { Scene } from "../types";

export interface TimeBarConfig {
    position: { x: number, y: number };
    timeBarOutlineTexture: string;
    timeBarTexture: string;
    timeOverCallback: () => void;
    scale?: number;
}

export class TimeBar {
    private container: Phaser.GameObjects.Container;
    private paused: boolean;
    private barScale: number;
    private startX: number;
    private timeBarOutline: Phaser.GameObjects.Image;
    private timeBarFull: Phaser.GameObjects.Image;
    private maskGraphics: Phaser.GameObjects.Graphics;
    private timeOverCallback: () => void;

    constructor(scene: Scene, config: TimeBarConfig) {
        const { position, timeBarOutlineTexture, timeBarTexture, timeOverCallback } = config;

        this.paused = false;
        this.barScale = config.scale ?? 2;
        this.startX = position.x;
        this.timeOverCallback = timeOverCallback;

        // Create container
        this.container = scene.add.container(position.x, position.y);

        // Create images at local 0,0
        this.timeBarOutline = scene.add.image(0, 0, timeBarOutlineTexture)
            .setScale(this.barScale);
        this.timeBarFull = scene.add.image(0, 0, timeBarTexture)
            .setScale(this.barScale);

        // Add to container
        this.container.add([this.timeBarOutline, this.timeBarFull]);

        // Create mask for clipping
        this.createMask(scene);
    }

    private createMask(scene: Scene): void {
        const width = this.timeBarFull.width * this.barScale;
        const height = this.timeBarFull.height * this.barScale;

        this.maskGraphics = scene.add.graphics();
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(-width * 0.5, -height * 0.5, width, height);

        const mask = this.maskGraphics.createGeometryMask();
        this.timeBarFull.setMask(mask);
    }

    updateProgress(progress: number): void {
        if (this.paused) return;

        // Clamp progress between 0 and 1
        progress = Math.min(Math.max(progress, 0), 1);

        // Update mask to show progress
        const width = this.timeBarFull.width * this.barScale;
        const height = this.timeBarFull.height * this.barScale;
        const progressWidth = width * progress;

        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(-width * 0.5, -height * 0.5, progressWidth, height);

        if (progress <= 0) {
            this.paused = true;
            this.timeOverCallback();
        }
    }

    pause(): void {
        this.paused = true;
    }

    resume(): void {
        this.paused = false;
    }

    isPaused(): boolean {
        return this.paused;
    }

    setPosition(x: number, y: number): this {
        this.container.setPosition(x, y);
        this.startX = x; // Update startX when position changes
        return this;
    }

    setAlpha(alpha: number): this {
        this.container.setAlpha(alpha);
        return this;
    }

    destroy(): void {
        this.maskGraphics?.destroy();
        this.container.destroy();
    }

    get gameObject(): Phaser.GameObjects.Container {
        return this.container;
    }
}