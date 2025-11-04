// eidosk/phaser/graphics/DrawingUtils.ts
import { Scene, GameObjects } from 'phaser';

export interface DrawingConfig {
    pos?: { x: number; y: number };
    color?: number;
    alpha?: number;
    lineWidth?: number;
}

export class DrawingUtils {
    private graphics: GameObjects.Graphics;
    private cursorX: number = 0;
    private cursorY: number = 0;

    constructor(scene: Scene, config: DrawingConfig = {}) {
        this.graphics = scene.add.graphics();

        const pos = config.pos || { x: scene.scale.width * 0.5, y: scene.scale.height * 0.5 };
        this.graphics.setPosition(pos.x, pos.y);

        if (config.alpha !== undefined) {
            this.graphics.setAlpha(config.alpha);
        }
    }

    // Expose the underlying graphics object for direct Phaser access
    get phaserGraphics(): GameObjects.Graphics {
        return this.graphics;
    }

    // Position methods
    setPosition(x: number, y: number): this {
        this.graphics.setPosition(x, y);
        return this;
    }

    setAlpha(alpha: number): this {
        this.graphics.setAlpha(alpha);
        return this;
    }

    // Cursor movement methods
    moveCursorTo(x: number, y: number): this {
        this.cursorX = x;
        this.cursorY = y;
        return this;
    }

    moveCursorBy(dx: number, dy: number): this {
        this.cursorX += dx;
        this.cursorY += dy;
        return this;
    }

    // Line drawing methods
    lineToCurrentPos(): this {
        this.graphics.lineTo(this.cursorX, this.cursorY);
        return this;
    }

    lineRight(pixels: number): this {
        this.cursorX += pixels;
        return this.lineToCurrentPos();
    }

    lineLeft(pixels: number): this {
        this.cursorX -= pixels;
        return this.lineToCurrentPos();
    }

    lineUp(pixels: number): this {
        this.cursorY -= pixels;
        return this.lineToCurrentPos();
    }

    lineDown(pixels: number): this {
        this.cursorY += pixels;
        return this.lineToCurrentPos();
    }

    // Path methods (delegated to graphics)
    beginPath(): this {
        this.graphics.beginPath();
        return this;
    }

    closePath(): this {
        this.graphics.closePath();
        return this;
    }

    moveTo(x: number, y: number): this {
        this.graphics.moveTo(x, y);
        this.cursorX = x;
        this.cursorY = y;
        return this;
    }

    lineTo(x: number, y: number): this {
        this.graphics.lineTo(x, y);
        this.cursorX = x;
        this.cursorY = y;
        return this;
    }

    // Style methods
    lineStyle(width: number, color: number, alpha?: number): this {
        this.graphics.lineStyle(width, color, alpha);
        return this;
    }

    fillStyle(color: number): this {
        this.graphics.fillStyle(color);
        return this;
    }

    // Drawing action methods
    strokePath(): this {
        this.graphics.strokePath();
        return this;
    }

    fillPath(): this {
        this.graphics.fillPath();
        return this;
    }

    strokeRect(x: number, y: number, width: number, height: number): this {
        this.graphics.strokeRect(x, y, width, height);
        return this;
    }

    fillRect(x: number, y: number, width: number, height: number): this {
        this.graphics.fillRect(x, y, width, height);
        return this;
    }

    // Shape drawing methods
    drawCross(size: number = 8, color: number = 0xFF00FF, alpha: number = 1.0): this {
        this.lineStyle(2, color, alpha);
        this.beginPath();
        this.moveTo(-size, -size);
        this.lineTo(size, size);
        this.moveTo(size, -size);
        this.lineTo(-size, size);
        this.closePath();
        this.strokePath();
        return this;
    }

    drawPixelPerfectRect(
        width: number,
        height: number,
        config: {
            fillColor?: number;
            strokeColor?: number;
            alpha?: number;
            hasShade?: boolean;
        } = {}
    ): this {
        const {
            fillColor = 0xffffff,
            strokeColor,
            alpha = 0.44,
            hasShade = false
        } = config;

        this.setAlpha(alpha);
        const cornerLength = 2;

        const drawRect = (offsetX: number, offsetY: number, color: number) => {
            this.beginPath();
            this.moveCursorTo(offsetX, offsetY + cornerLength);

            // Draw pixel-perfect corners
            this.lineRight(1).lineUp(1).lineRight(1).lineUp(1);
            this.lineRight(width - cornerLength * 2); // top
            this.lineDown(1).lineRight(1).lineDown(1).lineRight(1);
            this.lineDown(height - cornerLength * 2); // right
            this.lineLeft(1).lineDown(1).lineLeft(1).lineDown(1);
            this.lineLeft(width - cornerLength * 2); // bottom
            this.lineUp(1).lineLeft(1).lineUp(1).lineLeft(1);
            this.lineUp(height - cornerLength * 2); // left

            this.closePath();
            this.fillStyle(color);
            this.fillPath();

            if (strokeColor !== undefined) {
                this.lineStyle(1, strokeColor);
                this.strokePath();
            }
        };

        if (hasShade) {
            drawRect(1, cornerLength + 1, 0x306082); // Shadow
        }
        drawRect(0, cornerLength, fillColor); // Main shape

        return this;
    }

    // Utility methods
    clear(): this {
        this.graphics.clear();
        this.cursorX = 0;
        this.cursorY = 0;
        return this;
    }

    destroy(): void {
        this.graphics.destroy();
    }

    // Getters for position/state
    get x(): number { return this.graphics.x; }
    get y(): number { return this.graphics.y; }
    get alpha(): number { return this.graphics.alpha; }
    get visible(): boolean { return this.graphics.visible; }
    get cursorPosition(): { x: number; y: number } {
        return { x: this.cursorX, y: this.cursorY };
    }

    // Setters
    set visible(value: boolean) { this.graphics.visible = value; }

    // Factory method
    static create(scene: Scene, config?: DrawingConfig): DrawingUtils {
        return new DrawingUtils(scene, config);
    }

    // Static utility for quick drawing without creating an instance
    static drawCrossAt(
        scene: Scene,
        x: number,
        y: number,
        size: number = 8,
        color: number = 0xFF00FF
    ): GameObjects.Graphics {
        const graphics = scene.add.graphics();
        graphics.setPosition(x, y);
        graphics.lineStyle(2, color, 1.0);
        graphics.beginPath();
        graphics.moveTo(-size, -size);
        graphics.lineTo(size, size);
        graphics.moveTo(size, -size);
        graphics.lineTo(-size, size);
        graphics.closePath();
        graphics.strokePath();
        return graphics;
    }
}