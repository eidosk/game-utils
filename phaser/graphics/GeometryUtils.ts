// eidosk/phaser/graphics/GeometryUtils.ts
import { GameObjects } from 'phaser';

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export class GeometryUtils {
    static getBounds(gameObject: GameObjects.GameObject): Bounds | null {
        if (gameObject instanceof GameObjects.BitmapText) {
            const bounds = gameObject.getTextBounds().global;
            return bounds as Bounds;
        }

        if (gameObject instanceof GameObjects.Image ||
            gameObject instanceof GameObjects.Container ||
            gameObject instanceof GameObjects.Text) {
            return gameObject.getBounds() as Bounds;
        }

        return null;
    }

    static getCenter(gameObject: GameObjects.GameObject): Point | null {
        const bounds = this.getBounds(gameObject);
        if (!bounds) return null;

        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
        };
    }

    static distance(point1: Point, point2: Point): number {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static isPointInBounds(point: Point, bounds: Bounds): boolean {
        return point.x >= bounds.x &&
            point.x <= bounds.x + bounds.width &&
            point.y >= bounds.y &&
            point.y <= bounds.y + bounds.height;
    }

    static clampToBounds(point: Point, bounds: Bounds): Point {
        return {
            x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
            y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y))
        };
    }

    static scaleToFit(
        objectBounds: { width: number; height: number },
        containerBounds: { width: number; height: number },
        maintainAspectRatio: boolean = true
    ): { scaleX: number; scaleY: number } {
        if (!maintainAspectRatio) {
            return {
                scaleX: containerBounds.width / objectBounds.width,
                scaleY: containerBounds.height / objectBounds.height
            };
        }

        const scale = Math.min(
            containerBounds.width / objectBounds.width,
            containerBounds.height / objectBounds.height
        );

        return { scaleX: scale, scaleY: scale };
    }
}