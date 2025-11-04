// eidosk/phaser/graphics/DebugUtils.ts
import { GameObjects } from 'phaser';

export interface DebugConfig {
    color?: number;
    alpha?: number;
    showOrigin?: boolean;
    showBounds?: boolean;
}

export class DebugUtils {
    static drawDebugBox(
        gameObject: GameObjects.GameObject,
        config: DebugConfig = {}
    ): void {
        const {
            color = 0xFF00FF,
            alpha = 0.75,
            showOrigin = true,
            showBounds = true
        } = config;

        const obj = gameObject as any;
        const scene = gameObject.scene;
        const graphics = scene.add.graphics();

        // For containers, add as child (local coords)
        if (gameObject instanceof GameObjects.Container) {
            obj.add(graphics);
        }

        if (showBounds) {
            graphics.lineStyle(2, color, alpha);

            if (gameObject instanceof GameObjects.Container) {
                // Container: use input hit area or size
                const w = obj.input?.hitArea?.width || obj.width || 60;
                const h = obj.input?.hitArea?.height || obj.height || 60;
                graphics.strokeRect(-w / 2, -h / 2, w, h);
            } else {
                // Image/Text: use bounds in world space
                const bounds = obj.getBounds ? obj.getBounds() : null;
                if (bounds) {
                    graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                }
            }
        }

        if (showOrigin) {
            graphics.lineStyle(2, 0x00FF00, alpha);
            const size = 8;

            if (gameObject instanceof GameObjects.Container) {
                // Draw X at (0,0) in local space
                graphics.beginPath();
                graphics.moveTo(-size, -size);
                graphics.lineTo(size, size);
                graphics.moveTo(size, -size);
                graphics.lineTo(-size, size);
                graphics.closePath();
                graphics.strokePath();
            } else {
                // Draw circle at world position
                if (obj.x && obj.y) {
                    graphics.fillStyle(0x00FF00, alpha);
                    graphics.fillCircle(obj.x, obj.y, 4);
                }
            }
        }
    }
}