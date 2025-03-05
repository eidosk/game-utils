import { Scene } from "phaser";

export interface TimeBarConfig {
    position: { x: number, y: number };
    timeBarOutlineTexture: string;
    timeBarTexture: string;
    timeOverCallback: () => void; // Updated callback function name
}

export class ETimeBar extends Phaser.GameObjects.Container {
    private paused: boolean;
    private tScale: number;
    private startX: number;
    private timeBarOutline: Phaser.GameObjects.Image;
    private timeBarFull: Phaser.GameObjects.Image;
    private timeOverCallback: () => void; // Updated callback function name

    constructor(scene: Scene, timeBarConfig: TimeBarConfig) {
        const { position, timeBarOutlineTexture, timeBarTexture, timeOverCallback } = timeBarConfig;

        super(scene);
        this.scene = scene;
        this.paused = false;
        this.tScale = 2;
        this.startX = position.x;
        this.timeOverCallback = timeOverCallback; // Assign the callback function

        this.timeBarOutline = this.scene.add.image(position.x, position.y, timeBarOutlineTexture).setScale(this.tScale);
        this.timeBarFull = this.scene.add.image(position.x, position.y, timeBarTexture).setScale(this.tScale);

        this.add(this.timeBarOutline);
        this.add(this.timeBarFull);
        this.scene.add.existing(this);

        let shape = this.scene.add.graphics();
        let tWidth = this.timeBarFull.width * 2;
        let tHeight = this.timeBarFull.height * 2;

        shape.fillStyle(0xffffff, 0);
        shape.fillRect(position.x - tWidth * 0.5, position.y - tHeight * 0.5, tWidth, tHeight);

        this.timeBarFull.mask = shape.createGeometryMask();
    }

    updateProgress(progress: number): void { // progress ranges from 0 to 1
        this.timeBarFull.x = this.startX - this.timeBarFull.width * (1 - progress) * this.tScale;

        if (progress <= 0) {
            this.paused = true;
            this.timeOverCallback(); // Invoke the updated callback function
        }
    }

    pause(): void {
        this.paused = true;
    }

    resume(): void {
        this.paused = false;
    }
}
