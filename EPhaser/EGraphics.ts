import * as Phaser from 'phaser';
import Graphics = Phaser.GameObjects.Graphics;
import Point = Phaser.Geom.Point;
import Scene = Phaser.Scene;

/**
 * Create custom shapes with code.
 */
export class EGraphics extends Graphics {
    private currentX: number;
    private currentY: number;
    constructor(scene: Scene, pos: Point = new Point(scene.sys.game.canvas.width * 0.5, scene.sys.game.canvas.height * 0.5)) {
        super(scene);
        this.x = pos.x;
        this.y = pos.y;
        this.currentX = 0;
        this.currentY = 0;
        scene.add.existing(this);
    }

    /**
     * Move the drawing cursor to the current position.
     */
    lineToCurrentPos(): void {
        this.lineTo(this.currentX, this.currentY);
    }

    /**
     * Move the drawing cursor to the right by a specified number of pixels.
     * @param {number} pixels - The number of pixels to move right.
     */
    lineRight(pixels: number): void {
        this.currentX += pixels;
        this.lineToCurrentPos();
    }

    /**
     * Move the drawing cursor to the left by a specified number of pixels.
     * @param {number} pixels - The number of pixels to move left.
     */
    lineLeft(pixels: number): void {
        this.currentX -= pixels;
        this.lineToCurrentPos();
    }

    /**
     * Move the drawing cursor up by a specified number of pixels.
     * @param {number} pixels - The number of pixels to move up.
     */
    lineUp(pixels: number): void {
        this.currentY -= pixels;
        this.lineToCurrentPos();
    }

    /**
     * Move the drawing cursor down by a specified number of pixels.
     * @param {number} pixels - The number of pixels to move down.
     */
    lineDown(pixels: number): void {
        this.currentY += pixels;
        this.lineToCurrentPos();
    }

    drawX(size:number = 8){
        this.lineStyle(2, 0xFF00FF, 1.0);
        this.beginPath();
        this.moveTo(-size, -size);
        this.lineTo(size, size);
        this.moveTo(size, -size);
        this.lineTo(-size, size);
        this.closePath();
        this.strokePath();
    }

    /**
     * Draw a backing shape with optional shading.
     * @param {number} width - The width of the backing shape.
     * @param {number} height - The height of the backing shape.
     * @param {boolean} hasShade - Whether the backing shape has shading.
     * @param {number} alpha - The alpha value of the backing shape.
     * @param {number} color - The color of the backing shape.
     */

    drawBacking(
        width: number = 64,
        height: number = 32,
        hasShade: boolean = false,
        alpha: number = 0.44,
        color: number = 0xffffff
    ): void {
        this.alpha = alpha;
        const cLength = 2;

        const drawRectangle = (startX: number, startY: number, fillColor: number) => {
            this.beginPath();
            this.currentX = startX;
            this.currentY = startY;
            this.moveTo(this.currentX, this.currentY);
            this.lineRight(1);
            this.lineUp(1);
            this.lineRight(1);
            this.lineUp(1);
            this.lineRight(width - cLength * 2); // top side
            this.lineDown(1);
            this.lineRight(1);
            this.lineDown(1);
            this.lineRight(1);
            this.lineDown(height - cLength * 2); // right side
            this.lineLeft(1);
            this.lineDown(1);
            this.lineLeft(1);
            this.lineDown(1);
            this.lineLeft(width - cLength * 2); // bottom side
            this.lineUp(1);
            this.lineLeft(1);
            this.lineUp(1);
            this.lineLeft(1);
            this.lineUp(height - cLength * 2); // left side
            this.closePath();
            this.fillStyle(fillColor);
            this.fillPath();
        };

        if (hasShade) {
            //console.log("hasShadehasShadehasShade");
            //drawRectangle(this.currentX + 1, this.currentY + cLength + 1, 0x306082);
        }
        drawRectangle(0, cLength, color);
    }
}
