// eidosk/phaser/grid/GridTileAnimator.ts
import { Scene } from 'phaser';
import { TileGameObject } from 'eidosk/phaser';

export class GridTileAnimator {
    protected scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    async animateInvalidAction(tiles: TileGameObject[]): Promise<void> {
        if (!tiles || tiles.length === 0) return;

        const promises = tiles.map(tile => {
            if (!tile) return Promise.resolve();

            return new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile,
                    x: tile.x + 5,
                    duration: 50,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => resolve()
                });
            });
        });

        await Promise.all(promises);
    }

    async animateFallingTiles(
        tiles: { tile: any, fromY: number, toY: number }[],
        options: {
            duration?: number;
            ease?: string;
            gravity?: number;
            bounce?: boolean;
            yVelocity?: number;
        } = {}
    ): Promise<void> {
        const {
            duration = 400,
            ease = 'Linear',
            gravity,
            bounce = false,
            yVelocity
        } = options;

        const promises = tiles.map(({ tile, fromY, toY }) => {
            // Handle both LetterTile wrapper and direct Phaser objects
            const phaserObj = tile.object ?? tile;

            // Reset to starting Y before tween
            phaserObj.y = fromY;

            return new Promise<void>(resolve => {
                const tweenConfig: any = {
                    targets: phaserObj,
                    y: toY,
                    duration,
                    ease,
                    onComplete: () => resolve()
                };

                // Add physics-based effects if specified
                if (gravity && yVelocity) {
                    // Use physics-based movement
                    tweenConfig.ease = 'Power2.In'; // Gravity acceleration
                } else if (bounce) {
                    tweenConfig.ease = 'Bounce.Out';
                }

                this.scene.tweens.add(tweenConfig);
            });
        });

        await Promise.all(promises);
    }

    animateSelection(tile: TileGameObject): void {
        if (!tile) return;

        this.scene.tweens.add({
            targets: tile,
            scaleX: 1.1,
            scaleY: 1.1,
            alpha: 0.8,
            duration: 200,
            ease: 'Power2'
        });
    }

    animateDeselection(tile: TileGameObject): void {
        if (!tile) return;

        this.scene.tweens.add({
            targets: tile,
            scaleX: 1.0,
            scaleY: 1.0,
            alpha: 1.0,
            duration: 200,
            ease: 'Power2'
        });
    }

    animateHint(tiles: TileGameObject[]): void {
        tiles.forEach(tile => {
            if (tile) {
                this.scene.tweens.add({
                    targets: tile,
                    alpha: 0.6,
                    duration: 500,
                    yoyo: true,
                    repeat: 3,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }

    animatePathHighlight(tiles: TileGameObject[], color: number = 0xffff00): void {
        tiles.forEach(tile => {
            if (tile) {
                this.scene.tweens.add({
                    targets: tile,
                    alpha: 0.7,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });
    }

    clearPathHighlight(tiles: TileGameObject[]): void {
        tiles.forEach(tile => {
            if (tile) {
                this.scene.tweens.add({
                    targets: tile,
                    alpha: 1.0,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });
    }

    async animateSuccess(tiles: TileGameObject[], options: {
        scale?: number;
        duration?: number;
        ease?: string;
    } = {}): Promise<void> {
        const { scale = 1.2, duration = 300, ease = 'Back.Out' } = options;

        const promises = tiles.map(tile => {
            if (!tile) return Promise.resolve();

            return new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile,
                    scaleX: scale,
                    scaleY: scale,
                    duration: duration,
                    ease: ease,
                    yoyo: true,
                    onComplete: () => resolve()
                });
            });
        });

        await Promise.all(promises);
    }

    async animateFailure(tiles: TileGameObject[]): Promise<void> {
        const promises = tiles.map(tile => {
            if (!tile) return Promise.resolve();

            return new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile,
                    rotation: tile.rotation + 0.1,
                    duration: 50,
                    yoyo: true,
                    repeat: 4,
                    onComplete: () => {
                        tile.rotation = 0;
                        resolve();
                    }
                });
            });
        });

        await Promise.all(promises);
    }

    async animateTileRemoval(
        tiles: TileGameObject[],
        onTileDestroyed: (tile: TileGameObject) => void,
        options: {
            scale?: number;
            duration?: number;
            ease?: string;
        } = {}
    ): Promise<void> {
        const { scale = 1.3, duration = 300, ease = 'Power2' } = options;

        const promises = tiles.map(tile => {
            if (!tile) return Promise.resolve();

            return new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile,
                    scaleX: scale,
                    scaleY: scale,
                    alpha: 0,
                    duration: duration,
                    ease: ease,
                    onComplete: () => {
                        tile.destroy();
                        onTileDestroyed(tile);
                        resolve();
                    }
                });
            });
        });

        await Promise.all(promises);
    }

    stopAllAnimations(tile: TileGameObject): void {
        if (!tile) return;
        this.scene.tweens.killTweensOf(tile);
    }

    stopAllGridAnimations(tiles: (TileGameObject | null)[][]): void {
        tiles.forEach(row => {
            row.forEach(tile => {
                if (tile) {
                    this.stopAllAnimations(tile);
                }
            });
        });
    }

    destroy(): void {
        // Base cleanup - child classes can override
    }
}